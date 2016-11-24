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

const Client = {
  createList,
  addItemToList,
};
export default Client;
