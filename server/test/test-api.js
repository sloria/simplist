const Code = require('code');
const Lab = require('lab');
const _ = require('lodash');

const makeServer = require('./make-server');
const SimplistService = require('../service');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;
const DEFAULT_DESCRIPTION = SimplistService.DEFAULT_DESCRIPTION;


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
      service.createList().then((newList) => {
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
        service.getLists().then((result) => {
          expect(result.length).to.equal(1);
          done();
        });
      });
    });

    it('should create a new list with default description', (done) => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      server.inject(opts, (resp) => {
        expect(resp.statusCode).to.equal(201);
        db.collection('lists').find().limit(1).next((err, result) => {
          expect(result.description).to.be.a.string();
          expect(result.description).to.equal(DEFAULT_DESCRIPTION);
          done();
        });
      });
    });

    it('should create a new list with date updated', (done) => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      server.inject(opts, (resp) => {
        expect(resp.statusCode).to.equal(201);
        db.collection('lists').find().limit(1).next((err, result) => {
          expect(result.updatedAt).to.be.a.date();
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
        const promise = service.getList(body._id);
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
        const promise = service.getList(body._id);
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

    it('should update list\'s updatedAt', (done) => {
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
          db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
            expect(result.updatedAt).to.be.greaterThan(result.createdAt);
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

  describe('update list endpoint', () => {
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

    it('should update updatedAt', (done) => {
      service.createList().then((newList) => {
        const options = {
          method: 'PATCH',
          url: `/api/lists/${newList._id}`,
          payload: {
            title: 'Foo bar baz',
          },
        };

        db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
          const originalUpdatedAt = result.updatedAt;
          server.inject(options, (resp) => {
            expect(resp.statusCode).to.equal(200);
            db.collection('lists').findOne({ _id: newList._id }, (err2, updatedList) => {
              expect(updatedList.updatedAt).to.be.greaterThan(originalUpdatedAt);
              done();
            });
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

    it('should update the description', (done) => {
      const description = '*Foo* [bar](https://baz.qux)';
      service.createList().then((newList) => {
        const options = {
          method: 'PATCH',
          url: `/api/lists/${newList._id}`,
          payload: {
            description,
          },
        };
        server.inject(options, (resp) => {
          expect(resp.statusCode).to.equal(200);
          db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
            expect(result.description).to.equal(description);
            done();
          });
        });
      });
    });

    it('should error if description too long', (done) => {
      service.createList().then((newList) => {
        const options = {
          method: 'PATCH',
          url: `/api/lists/${newList._id}`,
          payload: {
            description: _.repeat('a', 1001),
          },
        };
        server.inject(options, (resp) => {
          expect(resp.statusCode).to.equal(400);
          db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
            expect(result.description).to.equal(DEFAULT_DESCRIPTION);
            done();
          });
        });
      });
    });

    it('should allow blank descriptions', (done) => {
      service.createList().then((newList) => {
        const options = {
          method: 'PATCH',
          url: `/api/lists/${newList._id}`,
          payload: {
            description: '',
          },
        };
        server.inject(options, (resp) => {
          expect(resp.statusCode).to.equal(200);
          db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
            expect(result.description).to.equal('');
            done();
          });
        });
      });
    });

    it('should allow reordering of items', (done) => {
      service.createList().then((list) => {
        service.addItemToList(list._id, 'foo').then(() => {
          service.addItemToList(list._id, 'bar').then((updatedList) => {
            expect(updatedList.items.length).to.equal(2);  // sanity check

            const itemIDs = updatedList.items.map(item => item._id);
            const reorderedIDs = _.reverse(itemIDs);

            const options = {
              method: 'PATCH',
              url: `/api/lists/${list._id}`,
              payload: {
                items: reorderedIDs,
              },
            };
            server.inject(options, (resp) => {
              expect(resp.statusCode).to.equal(200);
              db.collection('lists').findOne({ _id: list._id }, (err, result) => {
                expect(result.items).to.equal(reorderedIDs);
                done();
              });
            });
          });
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

    it('should update updatedAt', (done) => {
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
              expect(result.updatedAt).to.be.greaterThan(result.createdAt);
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

    it('should edit update updatedAt', (done) => {
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
            db.collection('lists').findOne({ _id: list._id }, (err, result) => {
              expect(result.updatedAt).to.be.greaterThan(result.createdAt);
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

    it('should update list\'s updatedAt', (done) => {
      service.createList().then((list) => {
        service.addItemToList(list._id, 'Foo bar baz').then((updatedList) => {
          const itemID = updatedList.items[0]._id;
          const options = {
            method: 'POST',
            url: `/api/lists/${list._id}/items/${itemID}/toggle`,
          };
          server.inject(options, (resp) => {
            expect(resp.statusCode).to.equal(200);
            db.collection('lists').findOne({ _id: list._id }, (err, result) => {
              expect(result.updatedAt).to.be.greaterThan(result.createdAt);
              done();
            });
          });
        });
      });
    });
  });
});
