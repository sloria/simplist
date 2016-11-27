/**
 * Simplist "service" plugin. Exposes a `SimplistService` object on
 * `request.simplist.service` and `server.simplist.service`. This contains
 * the business and data storage logic.
 */
const shortid = require('shortid');
const _ = require('lodash');

const generateID = shortid;

class RecordNotFoundError extends Error {}

class SimplistService {
  constructor(db, { publish = function noop() {} } = {}) {
    this.db = db;
    this.publish = publish;
  }
  createList({ title = '' } = {}) {
    const newList = {
      _id: generateID(),
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
  /**
   * Replace list's 'items' field (list of _ids) with the fully materialized documents.
   */
  _replaceItems(list) {
    return new Promise((resolve, reject) => {
      const result = Object.assign({}, list);
      if (!list.items) {
        resolve(result);
      }
      this.db.collection('items').find({ _id: { $in: list.items } }).toArray((err2, items) => {
        if (err2) { reject(err2); }
        // Sort items by their order in list.items
        const sortedItems = _.sortBy(items, (item) => {
          return list.items.indexOf(item._id);
        });
        result.items = sortedItems;
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
        this._replaceItems(result).then(resolve).catch(reject);
      });
    });
  }
  _clearAll() {
    this.db.dropDatabase();
  }
  updateList(_id, data) {
    // TODO: Validate item IDs
    const validFields = ['title', 'items'];
    const validData = _.pick(data, validFields);
    return new Promise((resolve, reject) => {
      this.db.collection('lists').updateOne({ _id }, { $set: validData }, (err, result) => {
        if (err) { reject(err); }
        if (!result.matchedCount) {
          reject(new RecordNotFoundError(`List with _id ${_id} not found.`));
        }
        this.db.collection('lists').findOne({ _id }, (err2, updatedList) => {
          if (err2) { reject(err2); }
          this._replaceItems(updatedList).then((finalList) => {
            this.publish(_id, finalList);
            resolve(finalList);
          }).catch(reject);
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
          _id: generateID(),
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
          }, (err3, listResult) => {
            if (err3) { reject(err3); }
            const updatedList = listResult.value;
            this._replaceItems(updatedList).then((finalList) => {
              this.publish(_id, finalList);
              resolve(finalList);
            }).catch(reject);
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
          this._replaceItems(updatedList).then((finalList) => {
            this.publish(listID, finalList);
            resolve(finalList);
          }).catch(reject);
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
        this.db.collection('items').updateOne({ _id: itemID }, { $set: { isDeleted: true } }, () => {
          this.db.collection('lists').findOne({ _id: listID }, (err2, updatedList) => {
            if (err2) { reject(err2); }
            this._replaceItems(updatedList).then((finalList) => {
              this.publish(listID, finalList);
              resolve(finalList);
            }).catch(reject);
          });
        });
      });
    });
  }
}

exports.RecordNotFoundError = RecordNotFoundError;
exports.SimplistService = SimplistService;

exports.register = (server, opts, next) => {
  function initPlugin(s, n) {
    const database = s.mongo.db;
    const service = new SimplistService(database, {
      publish: opts.publish,
    });
    // Expose the SimplistService instance on request and server
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
