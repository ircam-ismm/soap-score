import { html, render } from 'lit';
import { AudioBufferLoader } from '@ircam/sc-loader';
import App from './App.js';
import '@ircam/sc-components';

const audioContext = new AudioContext();

const app = new App(audioContext);

