/**
 * Simplist API Hapi plugin. Depends on the simplist-storage plugin for DB operations
 * and the nes plugin for WebSocket integration
 */

const Boom = require('boom');
const Joi = require('joi');
const Nes = require('nes');


function registerAPIRoutes(server, next) {
  server.route({
    method: 'GET',
    path: '/api/',
    handler: (request, reply) => {
      return reply({ message: 'Welcome to the Simplist API' });
    },
  });

  server.route({
    method: 'GET',
    path: '/api/lists/{listID}',
    handler: (request, reply) => {
      const db = request.getStorage();
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
      const db = request.getStorage();
      const title = request.payload.title || '';
      const newList = db.createList({ title }).value();
      return reply(newList);
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/{listID}/items/',
    handler: (request, reply) => {
      const db = request.getStorage();
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
          content: Joi.string().max(500).required(),
        },
      },
    },
  });

  server.route({
    method: 'PATCH',
    path: '/api/lists/{listID}',
    handler: (request, reply) => {
      const db = request.getStorage();
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
          title: Joi.string().max(200),
        },
      },
    },
  });

  server.route({
    method: 'DELETE',
    path: '/api/lists/{listID}/items/{itemID}',
    handler: (request, reply) => {
      const db = request.getStorage();
      const { listID, itemID } = request.params;
      let updatedList;
      try {
        updatedList = db.removeItem({ listID, itemID });
      } catch (e) { // TODO: Catch specific error
        return reply(Boom.notFound(`List with id ${listID} not found.`));
      }
      return reply(updatedList.value());
    },
  });

  server.route({
    method: 'PATCH',
    path: '/api/lists/{listID}/items/{itemID}',
    handler: (request, reply) => {
      const db = request.getStorage();
      const { listID, itemID } = request.params;
      let updatedList;
      try {
        updatedList = db.editItem({ listID, itemID, data: request.payload });
      } catch (e) { // TODO: Catch specific error
        return reply(Boom.notFound(`List with id ${listID} not found.`));
      }
      return reply(updatedList.value());
    },
    config: {
      validate: {
        payload: {
          content: Joi.string().max(1000),
          checked: Joi.boolean(),
        },
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/{listID}/items/{itemID}/toggle',
    handler: (request, reply) => {
      const db = request.getStorage();
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
  next();
}


function registerWebsocketRoutes(server, next) {
  server.subscription('/s/lists/{listID}');
  next();
}

exports.register = (server, options, next) => {
  server.dependency('simplist-storage', registerAPIRoutes);
  server.dependency('nes', registerWebsocketRoutes);
  server.register(Nes, () => {});
  next();
};

exports.register.attributes = {
  name: 'simplist-api',
};
