const Hapi = require('hapi');

const PORT = process.env.PORT || 3001;
const server = new Hapi.Server();
server.connection({
  port: PORT,
});

server.register([], () => {
  server.route({
    method: 'GET',
    path: '/api/',
    handler: (request, reply) => {
      return reply({ message: 'Welcome to the API' });
    },
  });

  server.start((err) => {
    if (err) {
      throw err;
    }

    console.log('Server running at:', server.info.uri);
  });
});
