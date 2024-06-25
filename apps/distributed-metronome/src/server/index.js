import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import { loadConfig } from '@soundworks/helpers/node.js';

import { Scheduler, Transport } from '@ircam/sc-scheduling';
import { getTime } from '@ircam/sc-utils';
import pluginPlatformInit from '@soundworks/plugin-platform-init/server.js';
import pluginSync from '@soundworks/plugin-sync/server.js';

import globalSchema from './schemas/global.js';

import '../utils/catch-unhandled-errors.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

/**
 * Create the soundworks server
 */
const server = new Server(config);
// configure the server for usage within this application template
server.useDefaultApplicationTemplate();

/**
 * Register plugins and schemas
 */
server.pluginManager.register('platform-init', pluginPlatformInit);
server.pluginManager.register('sync', pluginSync, {
  getTimeFunction: getTime,
});

server.stateManager.registerSchema('global', globalSchema);

await server.start();

const global = await server.stateManager.create('global');

const scheduler = new Scheduler(getTime);
const transport = new Transport(scheduler);

transport.add(() => {
  global.set({ transportState: transport.serialize() });
});

server.stateManager.registerUpdateHook('global', (updates, currentValues) => {
  if (updates.transportControl) {
    const [command, value] = updates.transportControl;
    const applyAt = getTime() + 0.1;

    // const guiState = currentValues.guiState;
    // if (['start', 'stop', 'pause'].includes(command)) {
    //   guiState.transport = command;
    // }

    const args = value !== undefined ? [value, applyAt] : [applyAt];

    const transportEvents = [
      transport.cancel(applyAt),
      transport[command](...args),
    ];

    return {
      ...updates,
      // guiState,
      transportEvents,
      transportState: transport.serialize(),
    };
  }
});
