import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';

import pluginSyncFactory from '@soundworks/plugin-sync/server.js';
import pluginPlatformInit from '@soundworks/plugin-platform-init/server.js';

import { Scheduler, Transport } from '@ircam/sc-scheduling'


import { loadConfig } from '../utils/load-config.js';
import '../utils/catch-unhandled-errors.js';

// @todo - rename
import globalsSchema from './schemas/globals.js';

import { getTime } from '@ircam/sc-gettime';

// import test scores from fixtures
import * as fixtures from '../../../tests/fixtures.js';
const scores = {};
for (let name in fixtures) {
  if (name.endsWith('Score')) {
    scores[name] = fixtures[name];
  }
}

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
server.pluginManager.register('sync', pluginSyncFactory, { getTimeFunction: getTime });

// @todo - rename÷
server.stateManager.registerSchema('globals', globalsSchema, { scores });

await server.start();

//
const sync = await server.pluginManager.get('sync');
const getTimeFunction = () => sync.getSyncTime();

const scheduler = new Scheduler(getTimeFunction);
const transport = new Transport(scheduler);

const globals = await server.stateManager.create('globals', {
  transportState: transport.getState(),
});

server.stateManager.registerUpdateHook('globals', (updates, currentValues) => {
  if (updates.transportCommand) {
    const command = updates.transportCommand;
    const applyAt = sync.getSyncTime() + 0.1;

    // cancel any scheduled event by default
    const transportEvents = [
      {
        type: 'cancel',
        time: applyAt,
      }
    ];

    switch (command) {
      case 'play':
        transportEvents.push({
          type: 'play',
          time: applyAt,
        });
        break;
      case 'pause':
        transportEvents.push({
          type: 'pause',
          time: applyAt,
        });
        break;
      case 'seek':
        transportEvents.push({
          type: 'seek',
          time: applyAt,
          position: updates.seekPosition || currentValues.seekPosition,
        });
        break;
    }

    return {
      ...updates,
      transportEvents,
    };
  }
});

globals.onUpdate(updates => {
  if (updates.transportEvents) {
    transport.addEvents(updates.transportEvents);
  }
});

const engine = {
  onTransportEvent(event, position, currentTime, dt) {
    globals.set({ transportState: transport.getState() });
    return event.speed > 0 ? position : Infinity;
  },
};

transport.add(engine);


