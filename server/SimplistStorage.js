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
    this.db = low(dbFile, { storage: asyncStore });
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
    const list = this.db.get('lists').getById(id);
    if (!list) {
      throw new Error(`List with id ${id} not found`);
    }
    return list;
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

module.exports = SimplistStorage;
