/**
 * Simplist API Hapi plugin. Routes and their handlers are defined here.
 * Depends on the simplist-service plugin for DB operations
 * and the nes plugin for WebSocket integration
 */

const Boom = require('boom');
const Joi = require('joi');
const Nes = require('nes');
const _ = require('lodash');

const Service = require('./service');

const RecordNotFoundError = Service.RecordNotFoundError;


function registerAPIRoutes(server) {
  server.route({
    method: 'GET',
    path: '/api/',
    handler: () => {
      return { message: 'Welcome to the Simplist API' };
    },
  });

  server.route({
    method: 'GET',
    path: '/api/lists/{listID}',
    handler: async (request) => {
      const service = request.simplist.service;
      const listID = request.params.listID;
      try {
        const result = await service.getList(listID);
        return result;
      } catch(err) {
        if (err instanceof RecordNotFoundError) {
          throw Boom.notFound(`List with id ${listID} not found.`);
        } else {
          throw Boom.wrap(err, 500, 'Unexpected error occurred.');
        }
      }
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/',
    handler: async (request, h) => {
      const service = request.simplist.service;
      const title = _.get(request, 'payload.title') || '';
      try {
        const result = await service.createList({ title });
        return h.response(result).code(201);
      } catch(err) {
        throw Boom.wrap(err);
      }
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/{listID}/items/',
    handler: (request, h) => {
      const service = request.simplist.service;
      const listID = request.params.listID;
      const content = request.payload.content;
      return service.addItemToList(listID, content)
        .then(updatedList => h.response(updatedList).code(201))
        .catch((err) => {
          if (err instanceof RecordNotFoundError) {
            throw Boom.notFound(`List with id ${listID} not found.`);
          } else {
            throw Boom.wrap(err, 500, 'Unexpected error occurred.');
          }
        });
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
    handler: async (request) => {
      const service = request.simplist.service;
      const listID = request.params.listID;
      try {
        return await service.updateList(listID, request.payload);
      } catch (err) {
        if (err instanceof RecordNotFoundError) {
          throw Boom.notFound(`List with id ${listID} not found.`);
        } else {
          throw Boom.wrap(err, 500, 'Unexpected error occurred.');
        }
      }
    },
    config: {
      validate: {
        payload: {
          title: Joi.string().max(200),
          items: Joi.array().items(Joi.string()),
          description: Joi.string().max(1000).allow(''),
        },
      },
    },
  });

  server.route({
    method: 'DELETE',
    path: '/api/lists/{listID}/items/{itemID}',
    handler: async (request, h) => {
      const service = request.simplist.service;
      const { listID, itemID } = request.params;
      try {
        await service.removeItem({ listID, itemID })
        return h.response(null).code(204);
      } catch (err) {
        if (err instanceof RecordNotFoundError) {
          throw Boom.notFound('Item not found');
        } else {
          throw Boom.wrap(err, 500, 'Unexpected error occurred.');
        }
      }
    },
  });

  server.route({
    method: 'PATCH',
    path: '/api/lists/{listID}/items/{itemID}',
    handler: async (request) => {
      const service = request.simplist.service;
      const { listID, itemID } = request.params;
      try {
        return await service.editItem({ listID, itemID, data: request.payload });
      } catch (err) {
        if (err instanceof RecordNotFoundError) {
          throw Boom.notFound(`List with id ${listID} not found.`);
        } else {
          throw Boom.wrap(err, 500, 'Unexpected error occurred.');
        }
      }
    },
    config: {
      validate: {
        payload: {
          content: Joi.string().max(500),
          checked: Joi.boolean(),
        },
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/{listID}/items/{itemID}/toggle',
    handler: async (request) => {
      const service = request.simplist.service;
      const { listID, itemID } = request.params;
      try {
        return await service.toggleItem({ listID, itemID });
      } catch (err) {
        if (err instanceof RecordNotFoundError) {
          throw Boom.notFound(`List with id ${listID} not found.`);
        } else {
          throw Boom.wrap(err, 500, 'Unexpected error occurred.');
        }
      }
    },
  });
}


function registerWebsocketRoutes(server) {
  server.subscription('/s/lists/{listID}');
}

exports.plugin = {
  name: 'simplist-api',
  async register(server) {
    server.dependency('simplist-service', registerAPIRoutes);
    await server.register(Nes);
    server.dependency('nes', registerWebsocketRoutes);
  },
};
