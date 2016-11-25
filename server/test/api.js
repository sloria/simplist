const Code = require('code');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;


describe('API', () => {
  it('should do something', (done) => {
    expect(2 + 2).to.equal(4);
    done();
  });
});
