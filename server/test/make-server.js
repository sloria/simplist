require('dotenv').config();
const Hapi = require('hapi');
const SimplistService = require('../service');
const SimplistAPI = require('../api');
const SimplistDatabase = require('../database');

module.exports = async function makeTestServer() {
  const plugins = [
    {
      plugin: SimplistDatabase,
      options: {
        url: process.env.TEST_MONGODB_URI,
      },
    },
    {
      plugin: SimplistService,
      options: {},
    },
    {
      plugin: SimplistAPI,
      options: {}
    },
  ];
  const server = new Hapi.Server({ port: 8888 });
  await server.register(plugins);
  await server.initialize();
  return server;
};
