const Lab = require('lab');
const _ = require('lodash');

const makeServer = require('./make-server');
const { DEFAULT_DESCRIPTION } = require('../service');

const {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
} = exports.lab = Lab.script();

describe('API', () => {
  let server;
  let service;
  let db;

  beforeEach(async () => {
    const s = await makeServer();
    server = s;
    db = server.mongo.db;
    service = server.simplist.service;
    await service._clearAll();
  });

  afterEach(async () => {
    await service._clearAll();
  });

  describe('index', () => {
    it('should respond with 200', async () => {
      const resp = await server.inject('/api/');
      expect(resp.statusCode).to.equal(200);
      expect(resp.result).to.equal({ message: 'Welcome to the Simplist API' });
    });
  });

  describe('get list endpoint', () => {
    it('should retrieve a list', async () => {
      const newList = await service.createList();
      const resp = await server.inject(`/api/lists/${newList._id}`);
      expect(resp.statusCode).to.equal(200);
      const body = resp.result;
      expect(body._id).to.equal(newList._id);
    });

    it('should error if list not found', async () => {
      const resp = await server.inject('/api/lists/notfound')
      expect(resp.statusCode).to.equal(404);
      const body = resp.result;
      expect(body.message).to.equal('List with id notfound not found.');
    });
  });

  describe('create list endpoint', () => {
    it('should create a new list', async () => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      const resp = await server.inject(opts)
      expect(resp.statusCode).to.equal(201);
      const result = await service.getLists();
      expect(result.length).to.equal(1);
      const list = result[0];
      expect(resp.result._id).to.equal(list._id);
    });

    it('should create a new list with default description', async () => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      const resp = await server.inject(opts)
      expect(resp.statusCode).to.equal(201);
      return new Promise((resolve, reject) => {
        db.collection('lists').find().limit(1).next((err, result) => {
          if (err) {
            reject(err);
          }
          expect(result.description).to.be.a.string();
          expect(result.description).to.equal(DEFAULT_DESCRIPTION);
          resolve();
        });
      })
    });

    it('should create a new list with date updated', async () => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      const resp = await server.inject(opts);
      expect(resp.statusCode).to.equal(201);
      return new Promise((resolve, reject) => {
        db.collection('lists').find().limit(1).next((err, result) => {
          if (err) {
            reject(err);
          }
          expect(result.updatedAt).to.be.a.date();
          resolve();
        });
      });
    });

    it('should return the newly created list', async () => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      const resp = await server.inject(opts)
      const body = resp.result;
      expect(body).to.include('_id');
      const list = await service.getList(body._id);
      expect(list).to.exist();
      expect(list.title).to.equal('');
    });

    it('should receive a title', async () => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
        payload: { title: 'foo' },
      };
      const resp = await server.inject(opts)
      const body = resp.result;
      expect(body).to.include('title');
      const list = await service.getList(body._id);
      expect(list).to.exist();
      expect(list.title).to.equal('foo');
    });
  });

  describe('create list items endpoint', () => {
    it('should create a new item on POST', async () => {
      const newList = await service.createList();
      const options = {
        method: 'POST',
        url: `/api/lists/${newList._id}/items/`,
        payload: {
          content: 'Lorem ipsum',
        },
      };
      const resp = await server.inject(options)
      expect(resp.statusCode).to.equal(201);
      return new Promise((resolve, reject) => {
        db.collection('items').find().toArray((err, result) => {
          if (err) {
            reject(err);
          }
          expect(result.length).to.equal(1);
          resolve();
        });
      });
    });

    it("should update list's updatedAt", async () => {
      const newList = await service.createList()
      const options = {
        method: 'POST',
        url: `/api/lists/${newList._id}/items/`,
        payload: {
          content: 'Lorem ipsum',
        },
      };
      const resp = await server.inject(options)
      expect(resp.statusCode).to.equal(201);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.updatedAt).to.be.greaterThan(result.createdAt);
          resolve();
        });
      })
    });

    it('should error if content is too long', async () => {
      const newList = await service.createList();
      const options = {
        method: 'POST',
        url: `/api/lists/${newList._id}/items/`,
        payload: {
          content: _.repeat('a', 501),
        },
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(400);
    });

    it('should modify the requested list', async () => {
      const newList = await service.createList();
      expect(newList.items.length).to.equal(0);  // sanity check
      const options = {
        method: 'POST',
        url: `/api/lists/${newList._id}/items/`,
        payload: {
          content: 'Lorem ipsum',
        },
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(201);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.items.length).to.equal(1);
          expect(result.items[0]).to.be.a.string();
          resolve();
        });
      });
    });
  });

  describe('update list endpoint', () => {
    it('should update title', async () => {
      const newList = await service.createList();
      const options = {
        method: 'PATCH',
        url: `/api/lists/${newList._id}`,
        payload: {
          title: 'Foo bar baz',
        },
      };
      const resp = await server.inject(options)
      expect(resp.statusCode).to.equal(200);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.title).to.equal('Foo bar baz');
          resolve();
        });
      });
    });

    it('should update updatedAt', async () => {
      const newList = await service.createList();
      const options = {
        method: 'PATCH',
        url: `/api/lists/${newList._id}`,
        payload: {
          title: 'Foo bar baz',
        },
      };
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: newList._id }, async (err, result) => {
          if (err) { reject(err); }
          const originalUpdatedAt = result.updatedAt;
          const resp = await server.inject(options);
          expect(resp.statusCode).to.equal(200);
          db.collection('lists').findOne({ _id: newList._id }, (err2, updatedList) => {
            if (err2) { reject(err2); }
            expect(updatedList.updatedAt).to.be.greaterThan(originalUpdatedAt);
            resolve();
          });
        });
      });
    });

    it('should error if title is too long', async () => {
      const newList = await service.createList();
      const options = {
        method: 'PATCH',
        url: `/api/lists/${newList._id}`,
        payload: {
          title: _.repeat('a', 201),
        },
      };
      const resp = await server.inject(options)
      expect(resp.statusCode).to.equal(400);
    });

    it('should update the description', async () => {
      const description = '*Foo* [bar](https://baz.qux)';
      const newList = await service.createList();
      const options = {
        method: 'PATCH',
        url: `/api/lists/${newList._id}`,
        payload: {
          description,
        },
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(200);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.description).to.equal(description);
          resolve();
        });
      });
    });

    it('should error if description too long', async () => {
      const newList = await service.createList();
      const options = {
        method: 'PATCH',
        url: `/api/lists/${newList._id}`,
        payload: {
          description: _.repeat('a', 1001),
        },
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(400);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.description).to.equal(DEFAULT_DESCRIPTION);
          resolve();
        });
      });
    });

    it('should allow blank descriptions', async () => {
      const newList = await service.createList();
      const options = {
        method: 'PATCH',
        url: `/api/lists/${newList._id}`,
        payload: {
          description: '',
        },
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(200);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: newList._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.description).to.equal('');
          resolve();
        });
      });
    });

    it('should allow reordering of items', async () => {
      const list = await service.createList();
      await service.addItemToList(list._id, 'foo');
      const updatedList = await service.addItemToList(list._id, 'bar');
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
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(200);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: list._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.items).to.equal(reorderedIDs);
          resolve();
        });
      });
    });
  });

  describe('delete item endpoint', () => {
    it('should remove item from a list', async () => {
      const list = await service.createList();
      const updatedList = await service.addItemToList(list._id, 'Foo bar baz')
      const itemID = updatedList.items[0]._id;
      const options = {
        method: 'DELETE',
        url: `/api/lists/${list._id}/items/${itemID}`,
      };
      const resp = await server.inject(options)
      expect(resp.statusCode).to.equal(204);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: list._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.items.length).to.equal(0);
          resolve();
        });
      });
    });

    it('should update updatedAt', async () => {
      const list = await service.createList();
      const updatedList = await service.addItemToList(list._id, 'Foo bar baz');
      const itemID = updatedList.items[0]._id;
      const options = {
        method: 'DELETE',
        url: `/api/lists/${list._id}/items/${itemID}`,
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(204);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: list._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.updatedAt).to.be.greaterThan(result.createdAt);
          resolve();
        });
      })
    });
  });

  describe('edit item endpoint', () => {
    it('should edit an item', async () => {
      const list = await service.createList();
      const updatedList = await service.addItemToList(list._id, 'Foo bar baz');
      const itemID = updatedList.items[0]._id;
      const options = {
        method: 'PATCH',
        url: `/api/lists/${list._id}/items/${itemID}`,
        payload: {
          content: 'Quux',
          checked: true,
        },
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(200);
      return new Promise((resolve, reject) => {
        db.collection('items').findOne({ _id: itemID }, (err, result) => {
          if (err) { reject(err); }
          expect(result.content).to.equal('Quux');
          expect(result.checked).to.be.true();
          resolve();
        });
      });
    });

    it('should edit update updatedAt', async () => {
      const list = await service.createList();
      const updatedList = await service.addItemToList(list._id, 'Foo bar baz');
      const itemID = updatedList.items[0]._id;
      const options = {
        method: 'PATCH',
        url: `/api/lists/${list._id}/items/${itemID}`,
        payload: {
          content: 'Quux',
          checked: true,
        },
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(200);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: list._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.updatedAt).to.be.greaterThan(result.createdAt);
          resolve();
        });
      });
    });

    it('should error if content too long', async () => {
      const list = await service.createList();
      const updatedList = await service.addItemToList(list._id, 'Foo bar baz');
      const itemID = updatedList.items[0]._id;
      const options = {
        method: 'PATCH',
        url: `/api/lists/${list._id}/items/${itemID}`,
        payload: {
          content: _.repeat('a', 501),
          checked: true,
        },
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(400);
    });
  });

  describe('toggle item endpoint', () => {
    it('should toggle checked state', async () => {
      const list = await service.createList();
      const updatedList = await service.addItemToList(list._id, 'Foo bar baz');
      const itemID = updatedList.items[0]._id;
      const options = {
        method: 'POST',
        url: `/api/lists/${list._id}/items/${itemID}/toggle`,
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(200);
      return new Promise((resolve, reject) => {
        db.collection('items').findOne({ _id: itemID }, (err, result) => {
          if (err) { reject(err); }
          expect(result.checked).to.be.true();
          resolve();
        });
      });
    });

    it("should update list's updatedAt", async () => {
      const list = await service.createList();
      const updatedList = await service.addItemToList(list._id, 'Foo bar baz');
      const itemID = updatedList.items[0]._id;
      const options = {
        method: 'POST',
        url: `/api/lists/${list._id}/items/${itemID}/toggle`,
      };
      const resp = await server.inject(options);
      expect(resp.statusCode).to.equal(200);
      return new Promise((resolve, reject) => {
        db.collection('lists').findOne({ _id: list._id }, (err, result) => {
          if (err) { reject(err); }
          expect(result.updatedAt).to.be.greaterThan(result.createdAt);
          resolve();
        });
      });
    });
  });
});
