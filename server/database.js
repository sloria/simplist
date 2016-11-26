/**
 * Database plugin that connects to MongoDB, creates necessary collections,
 * and creates indices.
 */
const Mongo = require('hapi-mongodb');

exports.register = (server, opts, next) => {
  server.register({
    register: Mongo,
    // Expose the database on server.mongo.db and request.mongo.db
    options: Object.assign({}, opts, { decorate: true }),
  }, () => {
    const db = server.mongo.db;
    db.createCollection('lists', {}, (err) => {
      if (err) { throw err; }
      server.log(['simplist-database', 'info'], 'Created "lists" collection');
    });
    db.createCollection('items', {}, (err) => {
      if (err) { throw err; }
      server.log(['simplist-database', 'info'], 'Created "items" collection');
    });
    // Create indices here

    next();
  });
};

exports.register.attributes = {
  name: 'simplist-database',
};
