import {
  isURL,
} from '@ircam/sc-utils';

import {
  createAudioBufferLoader
} from './AudioBufferLoader.js';

/**
 * Try to resolve different patterns for loading soundfiles
 * - if serverAddress is null, rely on default fetch behavior
 * - if serverAddress is not null, try to create an URL from pathname and serverAddress
 *
 * Note that this function is exported for testing purposes only.
 *
 * @param {string} pathname - Path to the resource to load
 * @param {string} [serverAddress=null] - An URL from which to build a absolute URL
 * @return {string|null} - Path relative to `process.cwd` if the file has been found
 *  on the file system, a valid URL or `null` if all strategies failed.
 * @throws if serverAddress is not avlid URL.
 */
export function resolvePathname(pathname, serverAddress = null) {
  // ensure given serverAddress is a valid URL
  if (serverAddress !== null && !isURL(serverAddress)) {
    throw new TypeError(`Cannot execute 'resolvePathname': Argument 2 ('${serverAddress}') is not null and is not a valid URL`);
  }

  if (serverAddress === null) {
    return pathname;
  } else {
    try {
      const url = new URL(pathname, serverAddress);
      return url.href;
    } catch(err) {
      // could not build the URL
      console.warn(`Cannot resolve path for value '${value}', ignoring...`);
      return null;
    }
  }
}

/**
 * Fetch a given file from the network and decode it
 * @param {BaseAudioContext} audioContext - audio context used to decode the file
 * @param {string} resolvedPathname - sanitized pathname as returned by `resolvePathname`
 * @param {AbortSignal} signal - signal to abort loading
 * @return {AudioBuffer|null} - Decoded audio buffer or null if aborted or failed
 */
async function loadFile(audioContext, resolvedPathname, signal) {
  if (signal.aborted) {
    return null;
  }

  let arrayBuffer;

  try {
    const response = await fetch(resolvedPathname, { signal });

    if (response.ok) {
      arrayBuffer = await response.arrayBuffer();
    } else {
      console.error(`${response.status} Error: Cannot fetch file '${resolvedPathname}'`);
      return null;
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err.message);
    }
    return null;
  }

  if (signal.aborted) {
    return null;
  }

  let audioBuffer;

  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error(err.message);
    return null;
  }

  if (signal.aborted) {
    return null;
  }

  return audioBuffer;
}

// create the AudioBufferLoader class with platform specific functionality
export const AudioBufferLoader = createAudioBufferLoader(
  window.BaseAudioContext,
  window.OfflineAudioContext,
  window.AudioBuffer,
  resolvePathname,
  loadFile,
);
