const low = require('lowdb');
const asyncStore = require('lowdb/lib/file-async');
const uuid = require('uuid');
const underscoreDB = require('underscore-db');

const utils = require('./utils');

const initialData = {
  lists: [],
};

class SimplistStorage {
  constructor(dbFile, options) {
    if (!dbFile || dbFile === ':memory:') {
      this.db = low();
    } else {
      this.db = low(dbFile, { storage: asyncStore });
    }
    this.db._.mixin(underscoreDB);
    this.db.defaults(initialData).value();
    if (options.publish) {
      this.publish = options.publish.bind(this);
    } else {
      this.publish = function noop() {};
    }
  }
  createList({ title }) {
    return this.db.get('lists').insert({ title, items: [] });
  }
  getLists() {
    return this.db.get('lists');
  }
  getList(id) {
    const list = this.db.get('lists').getById(id);
    if (!list) {
      throw new Error(`List with id ${id} not found`);
    }
    return list;
  }
  clearAll() {
    this.db.setState(initialData);
  }
  updateList(id, data) {
    const list = this.getList(id);
    const updatedList = list.assign(data);
    this.publish(id, updatedList.value());
    return updatedList;
  }
  addItemToList(id, content) {
    const list = this.getList(id);
    const newItem = { id: uuid(), checked: false, content };
    const updatedList = list.assign({ items: list.value().items.concat([newItem]) });
    this.publish(id, updatedList.value());
    return updatedList;
  }
  toggleItem({ listID, itemID }) {
    const list = this.getList(listID);
    const items = list.value().items;
    const newItems = utils.updateInArray(items, item => item.id === itemID, (oldItem) => {
      return { checked: !oldItem.checked };
    });
    const updatedList = list.assign({ items: newItems });
    this.publish(listID, updatedList.value());
    return updatedList;
  }
  editItem({ listID, itemID, data }) {
    const list = this.getList(listID);
    const items = list.value().items;
    const newItems = utils.updateInArray(items, item => item.id === itemID, () => {
      return data;
    });
    const updatedList = list.assign({ items: newItems });
    this.publish(listID, updatedList.value());
    return updatedList;
  }
  removeItem({ listID, itemID }) {
    const list = this.getList(listID);
    const items = list.value().items;

    const newItems = items.filter(item => item.id !== itemID);

    const updatedList = list.assign({ items: newItems });
    this.publish(listID, updatedList.value());
    return updatedList;
  }
}

exports.SimplistStorage = SimplistStorage;

exports.register = (server, opts, next) => {
  function getStorage() {
    return new SimplistStorage(opts.dbFile, {
      publish: opts.publish,
    });
  }
  server.decorate('request', 'getStorage', getStorage);
  server.decorate('server', 'getStorage', getStorage);
  next();
};

exports.register.attributes = {
  name: 'simplist-storage',
};
