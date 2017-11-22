# Simplist

[![Build Status](https://travis-ci.org/sloria/simplist.svg?branch=master)](https://travis-ci.org/sloria/simplist)
[![Greenkeeper badge](https://badges.greenkeeper.io/sloria/simplist.svg)](https://greenkeeper.io/)

One-click, collaborative lists.

## A work in progress

This is a rough work yet, but here's a preview: [http://simplist.sloria.com](http://simplist.sloria.com)

## Development

Simplist is comprised of a client-side SPA built with React.js and a server-side service built with Hapi.js.

* Run MongoDB using docker-compose

```
docker-compose up -d
```

* Clone this repo, install dependencies, and create a `.env` file.

```
git clone https://github.com/sloria/simplist.git
cd simplist
yarn install
cp .env.example .env
```

* Run the app. The following app will start up both the client- and server-side apps in development mode.

```bash
# Run the app
yarn run start:dev
```

### Running tests

```bash
# Run all tests
yarn test

# Only run client tests
yarn run test:client

# Only run server tests
yarn run test:server

# Run server tests with debugging
yarn run test:server:debug
```

## License

[MIT Licensed](https://sloria.mit-license.org/)
