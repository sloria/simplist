const Code = require('code');
const Lab = require('lab');
const _ = require('lodash');

const makeServer = require('./make-server');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;


describe('API', () => {
  let server;
  let service;
  let db;

  beforeEach((done) => {
    server = makeServer(() => {
      db = server.mongo.db;
      service = server.simplist.service;
      // Clear database after each test
      service._clearAll();
      done();
    });
  });

  afterEach((done) => {
    service._clearAll();
    done();
  });

  describe('index', () => {
    it('should respond with 200', (done) => {
      server.inject('/api/', (resp) => {
        expect(resp.statusCode).to.equal(200);
        done();
      });
    });
  });

  describe('get list endpoint', () => {
    it('should retrieve a list', (done) => {
      const storage = server.simplist.service;
      storage.createList().then((newList) => {
        server.inject(`/api/lists/${newList._id}`, (resp) => {
          expect(resp.statusCode).to.equal(200);
          const body = JSON.parse(resp.payload);
          expect(body._id).to.equal(newList._id);
          done();
        });
      }).catch(done);
    });

    it('should error if list not found', (done) => {
      server.inject('/api/lists/notfound', (resp) => {
        expect(resp.statusCode).to.equal(404);
        const body = JSON.parse(resp.payload);
        expect(body.message).to.equal('List with id notfound not found.');
        done();
      });
    });
  });

  describe('create list endpoint', () => {
    it('should create a new list', (done) => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      server.inject(opts, (resp) => {
        expect(resp.statusCode).to.equal(201);
        const storage = resp.request.simplist.service;
        storage.getLists().then((result) => {
          expect(result.length).to.equal(1);
          done();
        });
      });
    });

    it('should return the newly created list', (done) => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      server.inject(opts, (resp) => {
        const body = JSON.parse(resp.payload);
        expect(body).to.include('_id');
        const storage = resp.request.simplist.service;
        const promise = storage.getList(body._id);
        promise.then((list) => {
          expect(list).to.exist();
          expect(list.title).to.equal('');
          done();
        }).catch(done);
      });
    });

    it('should receive a title', (done) => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
        payload: { title: 'foo' },
      };
      server.inject(opts, (resp) => {
        const body = JSON.parse(resp.payload);
        expect(body).to.include('title');
        const storage = resp.request.simplist.service;
        const promise = storage.getList(body._id);
        promise.then((list) => {
          expect(list).to.exist();
          expect(list.title).to.equal('foo');
          done();
        }).catch(done);
      });
    });
  });

  describe('create list items endpoint', () => {
    it('should create a new item on POST', (done) => {
      service.createList().then((newList) => {
        const options = {
          method: 'POST',
          url: `/api/lists/${newList._id}/items/`,
          payload: {
            content: 'Lorem ipsum',
          },
        };
        server.inject(options, (resp) => {
          expect(resp.statusCode).to.equal(201);
          db.collection('items').find().toArray((err, result) => {
            expect(result.length).to.equal(1);
            done();
          });
        });
      }).catch(done);
    });

    it('should error if content is too long', (done) => {
      service.createList().then((newList) => {
        const options = {
          method: 'POST',
          url: `/api/lists/${newList._id}/items/`,
          payload: {
            content: _.repeat('a', 501),
          },
        };
        server.inject(options, (resp) => {
          expect(resp.statusCode).to.equal(400);
          done();
        });
      }).catch(done);
    });

    it('should modify the requested list', (done) => {
      service.createList().then((newList) => {
        expect(newList.items.length).to.equal(0);  // sanity check
        const options = {
          method: 'POST',
          url: `/api/lists/${newList._id}/items/`,
          payload: {
            content: 'Lorem ipsum',
          },
        };
        server.inject(options, (resp) => {
          expect(resp.statusCode).to.equal(201);
          db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
            expect(result.items.length).to.equal(1);
            expect(result.items[0]).to.be.a.string();
            done();
          });
        });
      }).catch(done);
    });
  });

  describe('list update endpoint', () => {
    it('should update title', (done) => {
      service.createList().then((newList) => {
        const options = {
          method: 'PATCH',
          url: `/api/lists/${newList._id}`,
          payload: {
            title: 'Foo bar baz',
          },
        };
        server.inject(options, (resp) => {
          expect(resp.statusCode).to.equal(200);
          db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
            expect(result.title).to.equal('Foo bar baz');
            done();
          });
        });
      });
    });

    it('should error if title is too long', (done) => {
      service.createList().then((newList) => {
        const options = {
          method: 'PATCH',
          url: `/api/lists/${newList._id}`,
          payload: {
            title: _.repeat('a', 201),
          },
        };
        server.inject(options, (resp) => {
          expect(resp.statusCode).to.equal(400);
          done();
        });
      });
    });
  });

  describe('delete item endpoint', () => {
    it('should remove item from a list', (done) => {
      service.createList().then((list) => {
        service.addItemToList(list._id, 'Foo bar baz').then((updatedList) => {
          const itemID = updatedList.items[0]._id;
          const options = {
            method: 'DELETE',
            url: `/api/lists/${list._id}/items/${itemID}`,
          };
          server.inject(options, (resp) => {
            expect(resp.statusCode).to.equal(200);
            db.collection('lists').findOne({ _id: list._id }, (err, result) => {
              expect(result.items.length).to.equal(0);
              done();
            });
          });
        });
      });
    });
  });

  describe('edit item endpoint', () => {
    it('should edit an item', (done) => {
      service.createList().then((list) => {
        service.addItemToList(list._id, 'Foo bar baz').then((updatedList) => {
          const itemID = updatedList.items[0]._id;
          const options = {
            method: 'PATCH',
            url: `/api/lists/${list._id}/items/${itemID}`,
            payload: {
              content: 'Quux',
              checked: true,
            },
          };
          server.inject(options, (resp) => {
            expect(resp.statusCode).to.equal(200);
            db.collection('items').findOne({ _id: itemID }, (err, result) => {
              expect(result.content).to.equal('Quux');
              expect(result.checked).to.be.true();
              done();
            });
          });
        });
      });
    });

    it('should error if content too long', (done) => {
      service.createList().then((list) => {
        service.addItemToList(list._id, 'Foo bar baz').then((updatedList) => {
          const itemID = updatedList.items[0]._id;
          const options = {
            method: 'PATCH',
            url: `/api/lists/${list._id}/items/${itemID}`,
            payload: {
              content: _.repeat('a', 501),
              checked: true,
            },
          };
          server.inject(options, (resp) => {
            expect(resp.statusCode).to.equal(400);
            done();
          });
        });
      });
    });
  });

  describe('toggle item endpoint', () => {
    it('should toggle checked state', (done) => {
      service.createList().then((list) => {
        service.addItemToList(list._id, 'Foo bar baz').then((updatedList) => {
          const itemID = updatedList.items[0]._id;
          const options = {
            method: 'POST',
            url: `/api/lists/${list._id}/items/${itemID}/toggle`,
          };
          server.inject(options, (resp) => {
            expect(resp.statusCode).to.equal(200);
            db.collection('items').findOne({ _id: itemID }, (err, result) => {
              expect(result.checked).to.be.true();
              done();
            });
          });
        });
      });
    });
  });
});
