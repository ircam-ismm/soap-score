import { AudioBufferLoader } from '@ircam/sc-loader';

import App from './App.js';

const audioContext = new AudioContext();
const loader = new AudioBufferLoader(audioContext);

let defaultScore = `\
BAR 1 [4/4] TEMPO [1/4]=90
BAR 2 2s
BAR 3 2s
BAR 4 [3+2+2/8] TEMPO [3/8]=60
`;

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

new App(audioContext, buffers, defaultScore);

