/**
 * Database plugin that connects to MongoDB, creates necessary collections,
 * and creates indices.
 */
const Mongo = require('hapi-mongodb');

// Error code for "collection already exists" error
const COLLECTION_EXISTS = 48;

exports.plugin = {
  name: 'simplist-database',
  async register(server, opts) {
    await server.register({
      plugin: Mongo,
      // Expose the database on server.mongo.db and request.mongo.db
      options: Object.assign({}, opts, { decorate: true }),
    })
    const db = server.mongo.db;
    db.createCollection('lists', {}, (err) => {
      if (err && err.code != COLLECTION_EXISTS) { throw err; }
      server.log(['simplist-database', 'info'], 'Created "lists" collection');
    });
    db.createCollection('items', {}, (err) => {
      if (err && err.code != COLLECTION_EXISTS) { throw err; }
      server.log(['simplist-database', 'info'], 'Created "items" collection');
    });
    // Create indices here
  },
};
