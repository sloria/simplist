const uuid = require('uuid');
const _ = require('lodash');

class RecordNotFoundError extends Error {}

class SimplistStorage {
  constructor(db, options) {
    this.db = db;
    if (options.publish) {
      this.publish = options.publish.bind(this);
    } else {
      this.publish = function noop() {};
    }
  }
  createList({ title = '' } = {}) {
    const newList = {
      _id: uuid(),
      title,
      items: [],
      createdAt: new Date(),
      isDeleted: false,
    };
    return new Promise((resolve, reject) => {
      this.db.collection('lists').insertOne(newList, (err) => {
        if (err) {
          reject(err);
        }
        resolve(newList);
      });
    });
  }
  getLists() {
    return new Promise((resolve, reject) => {
      this.db.collection('lists').find({}).toArray((err, result) => {
        if (err) { reject(err); }
        resolve(result);
      });
    });
  }
  getList(_id) {
    return new Promise((resolve, reject) => {
      this.db.collection('lists').findOne({ _id }, (err, result) => {
        if (err) {
          reject(err);
        }
        if (!result) {
          reject(new RecordNotFoundError(`List with _id ${_id} not found.`));
        }
        resolve(result);
      });
    });
  }
  clearAll() {
    this.db.dropDatabase();
  }
  updateList(_id, data) {
    const validFields = ['title'];
    const validData = _.pick(data, validFields);
    // const list = this.getList(id);
    // const updatedList = list.assign(data);
    // this.publish(id, updatedList.value());
    // return updatedList;
    return new Promise((resolve, reject) => {
      this.db.collection('lists').updateOne({ _id }, validData, (err, result) => {
        if (err) { reject(err); }
        if (!result.matchedCount) {
          reject(new RecordNotFoundError(`List with _id ${_id} not found.`));
        }
        this.db.collection('lists').findOne({ _id }, (err2, updatedList) => {
          if (err2) { reject(err2); }
          this.publish(_id, updatedList);
          resolve(updatedList);
        });
      });
    });
  }
  addItemToList(_id, content) {
    return new Promise((resolve, reject) => {
      // First check that the list exists by querying for the _id only
      this.db.collection('lists').find({ _id }, { _id: 1 }).limit(1).next((err, result) => {
        if (!result) {
          reject(new RecordNotFoundError(`List with _id ${_id} not found.`));
        }
        // Create new item
        const newItem = {
          _id: uuid(),
          content,
          isChecked: false,
          listID: _id,
          createdAt: new Date(),
          isDeleted: false,
        };
        this.db.collection('items').insertOne(newItem, (err2) => {
          if (err2) { reject(err2); }
          // Append new item's _id to list's items field
          this.db.collection('lists').findOneAndUpdate({ _id }, { $push: { items: newItem._id } }, {
            returnOriginal: false,  // return the updated record
          }, (err3, updatedList) => {
            if (err3) { reject(err3); }
            this.publish(_id, result);
            resolve(updatedList.value);
          });
        });
      });
    });
  }
  toggleItem({ listID, itemID }) {
    return new Promise((resolve, reject) => {
      this.db.collection('items').findOne({ _id: itemID }, (err, result) => {
        this.editItem({ listID, itemID, data: { checked: !result.checked } })
          .then(resolve).catch(reject);
      });
    });
  }
  editItem({ listID, itemID, data }) {
    // const list = this.getList(listID);
    // const items = list.value().items;
    // const newItems = utils.updateInArray(items, item => item.id === itemID, () => {
    //   return data;
    // });
    // const updatedList = list.assign({ items: newItems });
    // this.publish(listID, updatedList.value());
    // return updatedList;
    const validFields = ['content', 'checked'];
    const validData = _.pick(data, validFields);
    return new Promise((resolve, reject) => {
      this.db.collection('items').updateOne({ _id: itemID }, { $set: validData }, (err, result) => {
        if (err) { reject(err); }
        if (!result.matchedCount) {
          reject(new RecordNotFoundError(`Item with _id ${itemID} not found.`));
        }
        this.db.collection('lists').findOne({ _id: listID }, (err2, updatedList) => {
          if (err2) { reject(err2); }
          this.publish(listID, updatedList);
          resolve(updatedList);
        });
      });
    });
  }
  removeItem({ listID, itemID }) {
    return new Promise((resolve, reject) => {
      this.db.collection('lists').updateOne({ _id: listID }, { $pull: { items: itemID } }, (err, result) => {
        if (err) { reject(err); }
        if (!result.matchedCount) {
          reject(new RecordNotFoundError(`List with _id ${listID} not found.`));
        }
        this.db.collection('lists').findOne({ _id: listID }, (err2, updatedList) => {
          if (err2) { reject(err2); }
          this.publish(listID, updatedList);
          resolve(updatedList);
        });
      });
    });
  }
}

exports.RecordNotFoundError = RecordNotFoundError;
exports.SimplistStorage = SimplistStorage;

exports.register = (server, opts, next) => {
  function initPlugin(s, n) {
    const database = s.mongo.db;
    const service = new SimplistStorage(database, {
      publish: opts.publish,
    });
    const decorations = {
      service,
    };
    server.decorate('request', 'simplist', decorations);
    server.decorate('server', 'simplist', decorations);
    n();
  }

  server.dependency('simplist-database', initPlugin);
  next();
};

exports.register.attributes = {
  name: 'simplist-service',
};
