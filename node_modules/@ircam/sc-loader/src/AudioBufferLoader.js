import {
  isPlainObject,
  isString,
  isURL,
} from '@ircam/sc-utils';

export function createAudioBufferLoader(
  BaseAudioContext,
  OfflineAudioContext,
  AudioBuffer,
  resolvePathname,
  loadFile,
) {
  /**
   * The `AudioBufferLoader` interface allows to load `AudioBuffer` in Node.js
   * and the Browser with a unified interface.
   *
   * @example
   * import { AudioBufferLoader } from '@ircam/sc-loader';
   * // import { AudioContext } from 'node-web-audio-api';
   *
   * const audioContext = new AudioContext()
   * const loader = new AudioBufferLoader(audioContext);
   * // load one file
   * const buffer = await loader.load('path/to/file.wav');
   */
  class AudioBufferLoader {
    #audioContext = null;
    #serverAddress = null;
    #data = null;
    #abortController = null;

    /**
     * @param {AudioContext|number} sampleRateOrAudioContext - An exisiting AudioContext
     *  instance or a valid sample rate. Loaded audio buffers will be resampled to
     *  the given sample rate or audio context sample rate
     * @param {string} [serverAddress=null] - Optional server address URL to use
     *  for loading the audio files.
     */
    constructor(sampleRateOrAudioContext, serverAddress = null) {
      if (sampleRateOrAudioContext instanceof BaseAudioContext) {
        this.#audioContext = sampleRateOrAudioContext;
      } else if (Number.isFinite(sampleRateOrAudioContext) && sampleRateOrAudioContext > 0) {
        const sampleRate = sampleRateOrAudioContext;
        // sampleRate might still be considered invalid for web audio api implementation
        try {
          this.#audioContext = new OfflineAudioContext(1, 1, sampleRate);
        } catch (err) {
          throw new TypeError(`Cannot construct 'AudioBufferLoader': ${err.message}`);
        }
      } else {
        throw new TypeError(`Cannot construct 'AudioBufferLoader': Argument 1 should either an instance of BaseAudioContext or a valid sample rate`);
      }

        // make sure given serverAddress is a valid URL
      if (serverAddress !== null && !isURL(serverAddress)) {
        throw new TypeError(`Cannot construct 'AudioBufferLoader': Argument 2 ('${serverAddress}') is not null and is not a valid URL`);
      }

      this.#serverAddress = serverAddress;
    }

    /**
     * Sample rate of loader and decoded audio buffers
     */
    get sampleRate() {
      return this.#audioContext.sampleRate;
    }

    /**
     * Optional server address URL to use for loading the audio files.
     */
    get serverAddress() {
      return this.#serverAddress;
    }

    /**
     * Load audio buffers.
     *
     * In the browser, the given path to the audio files are resolved as following:
     * - if serverAddress is null, rely on default fetch behavior
     * - if serverAddress is not null, try to create an URL from pathname and serverAddress
     *
     * In Node.js,
     * - load from filesystem relative to `process.cwd()`
     * - load from filesystem relative to caller site
     * - load from network if an absolute URL is given
     * - if `serverAddress` is given and all other strategies failed, try to build
     *   a valid URL from `pathname` and `serverAddress`, and try to load from network
     *
     * Calling this function will erase the cache from previous `load` call.
     *
     * Returns `null` if aborted
     *
     * @example
     * // load single file
     * const buffer = await loader.load('path/to/file.wav');
     * // load array
     * const buffers = await loader.load(['file1.wav', 'file2.mp3', 'ile3.wav']);
     * // load object
     * const buffers = await loader.load({ file1: 'file1.wav' });
     *
     * @param {string|array<string>|object<string, string>} requestInfos - List of
     *  sound file to load, the returned value structure will match the strcuture
     *  of the argument. If the sound file could not be load (e.g. file not found or
     *  decoding error) the slot will be set to `null`.
     * @return {AudioBuffer|array<AudioBuffer>|object<string, AudioBuffer>}
     */
    async load(requestInfos) {
      this.#abortController = new AbortController();

      if (!isString(requestInfos) && !Array.isArray(requestInfos) && !isPlainObject(requestInfos)) {
        throw new TypeError(`Cannot execute 'load' on 'AudioBufferLoader': argument 1 should be string, array or object`);
      }

      const packedInfos = isString(requestInfos) ? [requestInfos] : requestInfos;
      const signal = this.#abortController.signal;
      const promises = [];

      for (let i in packedInfos) {
        const resolvedPathname = resolvePathname(packedInfos[i], this.#serverAddress);
        const promise = loadFile(this.#audioContext, resolvedPathname, signal);
        promises.push(promise);
      }

      const results = await Promise.all(promises);

      if (signal.aborted) {
        // keep old data
        this.#abortController = null;
        return null;
      }

      // populate clone of request infos
      let data = null;

      if (isString(requestInfos)) {
        data = results[0];
      } else if (Array.isArray(requestInfos)) {
        data = results;
      } else {
        data = {};
        let index = 0;

        for (let name in requestInfos) {
          data[name] = results[index];
          index += 1;
        }
      }

      if (signal.aborted) {
        // keep old data
        this.#abortController = null;
        return null;
      }

      Object.freeze(data); // prevent modifications from userland
      this.#data = data;
      this.#abortController = null;

      return this.#data;
    }

    /**
     * Get an AudioBuffer from cache according the its key or index.
     *
     * If the cache is a single `AudioBuffer`, it will be returned disregarding
     * the given key.
     *
     * @example
     * // load and get single file
     * await loader.load('path/to/file.wav');
     * const buffer = loader.get();
     * // load array and get file at index
     * await loader.load(['file1.wav', 'file2.mp3', 'ile3.wav']);
     * const buffer = loader.get(0);
     * // load object and get file by key
     * await loader.load({ file1: 'file1.wav' });
     * const buffer = loader.get('file1');
     *
     * @param {number|string} - Key to the AudioBuffer
     * @return {AudioBuffer}
     */
    get(key) {
      if (this.#data === null) {
        return null;
      }

      if (this.#data instanceof AudioBuffer) {
        return this.#data;
      }

      if (this.#data[key]) {
        return this.#data[key]
      }

      return null;
    }

    /**
     * Get full cache of the loader.
     *
     * @example
     * const buffers = await loader.load(['file1.wav', 'file2.mp3', 'ile3.wav']);
     * const cache = loader.getValues(0);
     * console.log(buffers === cache);
     *
     * @return {AudioBuffer|array<AudioBuffer>|object<string, AudioBuffer>}
     */
    getValues() {
      return this.#data;
    }

    /**
     * Abort an ongoing `load` call.
     *
     * The cache from previous `load` call will be preserved.
     *
     * @example
     * const promise = loader.load(['file1.wav', 'file2.mp3', 'ile3.wav']);
     * await true;
     * loader.abort();
     * const result = await promise;
     * console.log(result === null);
     *
     * @return {AudioBuffer|array<AudioBuffer>|object<string, AudioBuffer>}
     */
    abort() {
      // check we have something to abort
      if (this.#abortController !== null) {
        this.#abortController.abort();
      }
    }

    /**
     * Clear the cache.
     *
     * @example
     * const buffers = await loader.load(['file1.wav', 'file2.mp3', 'ile3.wav']);
     * loader.clear();
     * const cache = loader.getValues();
     * console.log(cache === null);
     */
    clear() {
      this.#data = null;
    }
  }

  return AudioBufferLoader;
}
