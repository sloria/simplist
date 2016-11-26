# simplist

**WIP**

Share-able collaborative lists.


## Development

* Run MongoDB on localhost:27017
* Clone this repo, install dependencies, and create a `.env` file.

```
git clone https://github.com/sloria/simplist.git
cd simplist
npm install
cp .env.example .env
```

* Run the app.

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
