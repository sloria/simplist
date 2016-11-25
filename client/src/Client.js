/* eslint-disable no-undef */

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error);
  throw error;
}

function parseJSON(response) {
  return response.json();
}


function fetchJSON(url, options) {
  options = options || {};  // eslint-disable-line
  const defaults = {
    accept: 'application/json',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const opts = Object.assign({}, defaults, options);
  if (options.body) {
    opts.body = JSON.stringify(options.body);
  }
  return fetch(url, opts).then(checkStatus).then(parseJSON);
}

function getList(id) {
  return fetchJSON(`/api/lists/${id}`);
}

function createList({ title }) {
  return fetchJSON('/api/lists/', {
    method: 'POST',
    body: { title },
  });
}

function addItemToList({ id, content }) {
  return fetchJSON(`/api/lists/${id}/items/`, {
    method: 'POST',
    body: { content },
  });
}

function toggleItem({ listID, itemID }) {
  return fetchJSON(`/api/lists/${listID}/items/${itemID}/toggle`, {
    method: 'POST',
  });
}

function editItem({ listID, itemID, data }) {
  return fetchJSON(`/api/lists/${listID}/items/${itemID}`, {
    method: 'PATCH',
    body: data,
  });
}

function deleteItem({ listID, itemID }) {
  return fetchJSON(`/api/lists/${listID}/items/${itemID}`, {
    method: 'DELETE',
  });
}

function updateList({ id, data }) {
  return fetchJSON(`/api/lists/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

const Client = {
  getList,
  createList,
  addItemToList,
  toggleItem,
  updateList,
  editItem,
  deleteItem,
};
export default Client;
