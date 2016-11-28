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
      const service = request.simplist.service;
      const listID = request.params.listID;
      service.getList(listID)
        .then(reply)
        .catch((err) => {
          if (err instanceof RecordNotFoundError) {
            reply(Boom.notFound(`List with id ${listID} not found.`));
          } else {
            reply(Boom.wrap(err, 500, 'Unexpected error occurred.'));
          }
        });
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/',
    handler: (request, reply) => {
      const service = request.simplist.service;
      const title = _.get(request, 'payload.title') || '';
      service.createList({ title })
        .then(newList => reply(newList).code(201))
        .catch(err => reply(Boom.wrap(err)));
    },
  });

  server.route({
    method: 'POST',
    path: '/api/lists/{listID}/items/',
    handler: (request, reply) => {
      const service = request.simplist.service;
      const listID = request.params.listID;
      const content = request.payload.content;

      service.addItemToList(listID, content)
        .then(updatedList => reply(updatedList).code(201))
        .catch((err) => {
          if (err instanceof RecordNotFoundError) {
            reply(Boom.notFound(`List with id ${listID} not found.`));
          } else {
            reply(Boom.wrap(err, 500, 'Unexpected error occurred.'));
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
    handler: (request, reply) => {
      const service = request.simplist.service;
      const listID = request.params.listID;
      service.updateList(listID, request.payload)
        .then(reply)
        .catch((err) => {
          if (err instanceof RecordNotFoundError) {
            reply(Boom.notFound(`List with id ${listID} not found.`));
          } else {
            reply(Boom.wrap(err, 500, 'Unexpected error occurred.'));
          }
        });
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
    handler: (request, reply) => {
      const service = request.simplist.service;
      const { listID, itemID } = request.params;
      service.removeItem({ listID, itemID })
        .then(reply)
        .catch((err) => {
          if (err instanceof RecordNotFoundError) {
            reply(Boom.notFound(`List with id ${listID} not found.`));
          } else {
            reply(Boom.wrap(err, 500, 'Unexpected error occurred.'));
          }
        });
    },
  });

  server.route({
    method: 'PATCH',
    path: '/api/lists/{listID}/items/{itemID}',
    handler: (request, reply) => {
      const service = request.simplist.service;
      const { listID, itemID } = request.params;
      service.editItem({ listID, itemID, data: request.payload })
        .then(reply)
        .catch((err) => {
          if (err instanceof RecordNotFoundError) {
            reply(Boom.notFound(`List with id ${listID} not found.`));
          } else {
            reply(Boom.wrap(err, 500, 'Unexpected error occurred.'));
          }
        });
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
    handler: (request, reply) => {
      const service = request.simplist.service;
      const { listID, itemID } = request.params;
      service.toggleItem({ listID, itemID })
        .then(reply)
        .catch((err) => {
          if (err instanceof RecordNotFoundError) {
            reply(Boom.notFound(`List with id ${listID} not found.`));
          } else {
            reply(Boom.wrap(err, 500, 'Unexpected error occurred.'));
          }
        });
    },
  });
  next();
}


function registerWebsocketRoutes(server, next) {
  server.subscription('/s/lists/{listID}');
  next();
}

exports.register = (server, options, next) => {
  server.dependency('simplist-service', registerAPIRoutes);
  server.dependency('nes', registerWebsocketRoutes);
  server.register(Nes, () => {
    next();
  });
};

exports.register.attributes = {
  name: 'simplist-api',
};
