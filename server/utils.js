const _ = require('lodash');

function replaceAt(array, index, replacement) {
  return array.slice(0, index).concat([replacement]).concat(array.slice(index + 1));
}

function updateInArray(array, predicate, update) {
  const index = _.findIndex(array, predicate);
  return replaceAt(
    array,
    index,
    Object.assign({}, array[index], update(array[index]))
  );
}

module.exports = {
  replaceAt,
  updateInArray,
};
