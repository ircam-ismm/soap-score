import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  isURL,
} from '@ircam/sc-utils';
import caller from 'caller';
import fetch from 'node-fetch';
import {
  AudioBuffer,
  BaseAudioContext,
  OfflineAudioContext,
} from 'node-web-audio-api';

import {
  createAudioBufferLoader
} from './AudioBufferLoader.js';

/**
 * Try to resolve different patterns for loading soundfiles
 * - filesystem relative to `process.cwd()`
 * - filesystem relative to caller site
 * - online absolute URLs
 * - if `serverAddress` is given and all other strategies failed, try to build
 *   a valid URL from `pathname` and `serverAddress`
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

  // pathname is an absolute URL, just return it
  if (pathname.startsWith('http')) {
    return pathname;
  }

  // try to find given pathname on filesystem, either relative to cwd or to caller site
  const normPathname = path.normalize(pathname);

  // test if file relative to `process.cwd()` is found
  if (fs.existsSync(normPathname)) {
    return path.relative(process.cwd(), normPathname);
  } else {
    // test if file exists relative to caller site
    const depth = process.env.SC_LOADER_RESOLVE_TEST === '1' ? 1 : 2;
    const callerSite = caller(depth);
    const dirname = path.dirname(callerSite.replace('file://', ''));
    const absPathname = path.join(dirname, normPathname);

    if (fs.existsSync(absPathname)) {
      // return path relative to cwd
      return path.relative(process.cwd(), absPathname);
    }

    // File not found on file system but address is given, create an URL from these informations
    if (serverAddress !== null) {
      try {
        const url = new URL(pathname, serverAddress);
        return url.href;
      } catch(err) {
        // could not build the URL
        console.warn(`Cannot resolve path for value '${value}', ignoring...`);
        return null;
      }
    }

    // return null in all other cases
    console.warn(`Cannot resolve path for value '${value}', ignoring...`);
    return null;
  }
}

/**
 * Fetch a given file from the network or from the filesystem and decode it
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

  if (resolvedPathname.startsWith('http')) {
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
  } else {
    try {
      const contents = await readFile(resolvedPathname, { signal });
      arrayBuffer = contents.buffer;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err.message);
      }
      return null;
    }
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
  BaseAudioContext,
  OfflineAudioContext,
  AudioBuffer,
  resolvePathname,
  loadFile,
);
