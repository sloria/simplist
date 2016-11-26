# simplist

One-click, collaborative lists.

## A work in progress

This is a rough work yet, but here's a preview: [http://simplist.sloria.com](http://simplist.sloria.com)

## Development

Simplist is comprised of a client-side SPA built with React.js and a server-side service built with Hapi.js.

* Run MongoDB on localhost:27017
* Clone this repo, install dependencies, and create a `.env` file.

```
git clone https://github.com/sloria/simplist.git
cd simplist
npm install
cp .env.example .env
```

* Run the app. The following app will start up both the client- and server-side apps in development mode.

```bash
# Run the app
npm run start:dev
```

### Running tests

```bash
# Run all tests
npm test

# Only run client tests
npm run test:client

# Only run server tests
npm run test:server

# Run server tests with debugging
npm run test:server:debug
```

## License

[MIT Licensed](https://sloria.mit-license.org/)
