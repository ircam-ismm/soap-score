import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { AudioBufferLoader } from '@ircam/sc-loader';

import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js';
import pluginSync from '@soundworks/plugin-sync/client.js';

import App from './App.js';
import '@ircam/sc-components/sc-clock.js';
import '../components/sw-credits.js';
import '../components/SoapTransportControl.js'

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const audioContext = new AudioContext();
const loader = new AudioBufferLoader(audioContext);

let defaultScore = null;
const searchParams = new URLSearchParams(window.location.search);

if (searchParams.has('score')) {
  defaultScore = decodeURIComponent(searchParams.get('score'));
}

const buffers = {
  'drum' : await loader.load([
    './assets/kick.wav',
    './assets/bell.wav',
    './assets/sidestik.wav',
  ]),
  'old-numerical': await loader.load('./assets/old-numerical.wav'),
  'mechanical': await loader.load([
    './assets/mechanical-026.wav',
    './assets/mechanical-001.wav',
    './assets/mechanical-002.wav',
    './assets/mechanical-003.wav',
    './assets/mechanical-004.wav',
    './assets/mechanical-005.wav',
    './assets/mechanical-006.wav',
    './assets/mechanical-007.wav',
    './assets/mechanical-008.wav',
    './assets/mechanical-009.wav',
    './assets/mechanical-010.wav',
    './assets/mechanical-011.wav',
    './assets/mechanical-012.wav',
    './assets/mechanical-013.wav',
    './assets/mechanical-014.wav',
    './assets/mechanical-015.wav',
    './assets/mechanical-016.wav',
    './assets/mechanical-017.wav',
    './assets/mechanical-018.wav',
    './assets/mechanical-019.wav',
    './assets/mechanical-020.wav',
    './assets/mechanical-021.wav',
    './assets/mechanical-022.wav',
    './assets/mechanical-023.wav',
    './assets/mechanical-024.wav',
    './assets/mechanical-025.wav',
  ]),
  'drumstick': await loader.load('./assets/drumstick.wav'),
}

async function main($container) {
  const config = loadConfig();
  const client = new Client(config);

  client.pluginManager.register('platform-init', pluginPlatformInit, {
    audioContext,
  });

  client.pluginManager.register('sync', pluginSync, {
    getTimeFunction: () => audioContext.currentTime,
  }, ['platform-init']);

  launcher.register(client, { initScreensContainer: $container });

  await client.start();

  const app = new App(client, $container, audioContext, buffers, defaultScore);
  await app.init();
}

launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
});
