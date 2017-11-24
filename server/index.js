require('dotenv').config();
const path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');

const SimplistService = require('./service');
const SimplistDatabase = require('./database');
const SimplistAPI = require('./api');


// REACT_APP_SERVER_PORT is a misleading name.
// It is the port that the API sever runs on, not the react app
// The REACT_APP_ prefix is necessary so that the variable can be
// used on the frontend, see
// https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables
// Also note: $PORT is used on heroku. REACT_APP_SERVER_PORT is used for developement.
const server = new Hapi.Server({ port: process.env.PORT || process.env.REACT_APP_SERVER_PORT });

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
