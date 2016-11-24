const low = require('lowdb');
const underscoreDB = require('underscore-db');

const initialData = {
  lists: [],
};

// https://gist.github.com/LeverOne/1308368
function uuid(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b}  // eslint-disable-line

class SimplistStorage {
  constructor(dbFile, options) {
    this.db = low(dbFile);
    this.db._.mixin(underscoreDB);
    this.db.defaults(initialData).value();
    this.publish = options.publish.bind(this) || function noop() {};
  }
  createList({ title }) {
    return this.db.get('lists').insert({ title, items: [] });
  }
  getLists() {
    return this.db.get('lists');
  }
  getList(id) {
    return this.db.get('lists').getById(id);
  }
  addItemToList(id, content) {
    const list = this.getList(id);
    if (!list) {
      throw new Error(`List with id ${id} not found`);
    }
    const newItem = { id: uuid(), checked: false, content };
    const updatedList = list.assign({ items: list.value().items.concat([newItem]) });
    this.publish(id, updatedList);
    return updatedList;
  }
}

module.exports = SimplistStorage;
