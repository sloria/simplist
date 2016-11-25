const Hapi = require('hapi');

const SimplistStorage = require('../storage');
const SimplistAPI = require('../api');

module.exports = function makeTestServer(done) {
  const plugins = [
    {
      register: SimplistStorage,
      options: {
        dbFile: ':memory:',
      },
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
