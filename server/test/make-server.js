require('dotenv').config();
const Hapi = require('hapi');
const SimplistService = require('../service');
const SimplistAPI = require('../api');
const SimplistDatabase = require('../database');

module.exports = function makeTestServer(done) {
  const plugins = [
    {
      register: SimplistDatabase,
      options: {
        url: process.env.TEST_MONGODB_URI,
      },
    },
    {
      register: SimplistService,
      options: {},
    },
    SimplistAPI,
  ];
  const server = new Hapi.Server();
  server.connection({ port: 8888 });
  server.register(plugins, (err) => {
    if (err) {
      done(err);
    }
    server.initialize(done);
  });
  return server;
};
