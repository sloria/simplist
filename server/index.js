require('dotenv').config();
const path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');

const SimplistService = require('./service');
const SimplistDatabase = require('./database');
const SimplistAPI = require('./api');

const config = require('../shared-config');

const server = new Hapi.Server({ port: config.port });

const start = async () => {
  // Serve built static files on production
  // In development, we use the webpack-dev-server
  if (process.env.NODE_ENV === 'production') {
    await server.register(Inert);
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
  }

  // Set up the application
  await server.register([
    {
      plugin: SimplistDatabase,
      options: {
        url: process.env.MONGODB_URI,
        decorate: true,
      },
    },
    {
      plugin: SimplistService,
      options: {
        publish: (listID, payload) => {
          server.publish(`/s/lists/${listID}`, payload);
        },
      },
    },
    {
      plugin: SimplistAPI,
      options: {},
    },
  ]);
  await server.start();
  console.log('Server running at:', server.info.uri);
}

start();
