/**
 * Configuration accessible from both the server and the client
 */
module.exports = {
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV,
  domain: process.env.DOMAIN || 'simplist.sloria.com',
};
