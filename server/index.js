const Hapi = require('hapi');
const Boom = require('boom');
const Good = require('good');
const Joi = require('joi');
const Nes = require('nes');
const SimplistStorage = require('./SimplistStorage');

const server = new Hapi.Server();
server.connection({
  port: 3001,
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

server.register([Nes], () => {
  const db = new SimplistStorage('db.json', {
    publish: (listID, payload) => {
      server.publish(`/lists/${listID}`, payload);
    },
  });

  // API

  server.route({
    method: 'GET',
    path: '/api/lists/{listID}',
    handler: (request, reply) => {
      const listID = request.params.listID;
      const list = db.getList(listID).value();
      if (!list) {
        return reply(Boom.notFound(`List with id ${listID} not found.`));
      }
      return reply(list);
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/',
    handler: (request, reply) => {
      const title = request.payload.title || '';
      const newList = db.createList({ title }).value();
      return reply(newList);
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/{listID}/items/',
    handler: (request, reply) => {
      const listID = request.params.listID;
      const content = request.payload.content;
      let updatedList;
      try {
        updatedList = db.addItemToList(listID, content);
      } catch (e) { // TODO: Catch specific error
        return reply(Boom.notFound(`List with id ${listID} not found.`));
      }
      return reply(updatedList.value());
    },
    config: {
      validate: {
        payload: {
          content: Joi.string().required(),
        },
      },
    },
  });

  server.route({
    method: 'PATCH',
    path: '/api/lists/{listID}',
    handler: (request, reply) => {
      const listID = request.params.listID;
      let updatedList;
      try {
        updatedList = db.updateList(listID, request.payload);
      } catch (e) { // TODO: Catch specific error
        return reply(Boom.notFound(`List with id ${listID} not found.`));
      }
      return reply(updatedList.value());
    },
    config: {
      validate: {
        payload: {
          title: Joi.string(),
        },
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/{listID}/items/{itemID}/toggle',
    handler: (request, reply) => {
      const { listID, itemID } = request.params;
      let updatedList;
      try {
        updatedList = db.toggleItem({ listID, itemID });
      } catch (e) { // TODO: Catch specific error
        return reply(Boom.notFound(`List with id ${listID} not found.`));
      }
      return reply(updatedList.value());
    },
  });

  // Websocket subscriptions

  server.subscription('/lists/{listID}');


  // Start the server

  server.start((err) => {
    if (err) { throw err; }
    console.log('Server running at:', server.info.uri);
    server.publish('/lists/', { id: 'abc12', title: 'Test' });
  });
});
