const path = require('path');
const Hapi = require('hapi');
const Good = require('good');
const Blipp = require('blipp');

const Inert = require('inert');

const SimplistStorage = require('./storage');
const SimplistAPI = require('./api');

const config = require('../config');


const server = new Hapi.Server();
server.connection({
  port: config.port,
});

// Set up logging
server.register({
  register: Good,
  options: {
    reporters: {
      console: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ log: '*', response: '*', error: '*' }],
        },
        {
          module: 'good-console',
        },
        'stdout',
      ],
    },
  },
});


// Serve built static files on production
// In development, we use the webpack-dev-server
if (process.env.NODE_ENV === 'production') {
  server.register(Inert, () => {
    server.route({
      method: 'GET',
      path: '/static/{param*}',
      handler: {
        directory: {
          path: path.join(__dirname, '..', 'client', 'build', 'static'),
          redirectToSlash: true,
          index: true,
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        file: path.join(__dirname, '..', 'client', 'build', 'index.html'),
      },
    });
  });
}

// Set up the application routes
server.register([
  Blipp,
  {
    register: SimplistStorage,
    options: {
      dbFile: 'db.json',
      publish: (listID, payload) => {
        server.publish(`/s/lists/${listID}`, payload);
      },
    },
  },
  SimplistAPI,
], () => {
  // Start the server
  server.start((err) => {
    if (err) { throw err; }
    console.log('Server running at:', server.info.uri);
  });
});
