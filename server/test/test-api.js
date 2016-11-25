const Code = require('code');
const Lab = require('lab');

const makeServer = require('./make-server');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const beforeEach = lab.beforeEach;
const expect = Code.expect;


describe('API', () => {
  let server;

  before((done) => {
    server = makeServer();
    done();
  });

  // Clear db after each test
  beforeEach((done) => {
    server.getStorage().clearAll();
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

  describe('create list endpoint', () => {
    it('should create a new list', (done) => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      server.inject(opts, (resp) => {
        expect(resp.statusCode).to.equal(200);
        const storage = resp.request.getStorage();
        expect(storage.getLists().value().length).to.equal(1);
        done();
      });
    });

    it('should return the newly created list', (done) => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
      };
      server.inject(opts, (resp) => {
        const body = JSON.parse(resp.payload);
        expect(body).to.include('id');
        const storage = resp.request.getStorage();
        const list = storage.getList(body.id).value();
        expect(list).to.exist();
        expect(list.title).to.equal('');
        done();
      });
    });

    it('should receive a title', (done) => {
      const opts = {
        method: 'POST',
        url: '/api/lists/',
        payload: {title: 'foo'},
      };
      server.inject(opts, (resp) => {
        const body = JSON.parse(resp.payload);
        expect(body).to.include('title');
        const storage = resp.request.getStorage();
        const list = storage.getList(body.id).value();
        expect(list).to.exist();
        expect(list.title).to.equal('foo');
        done();
      });
    });
  });
});
