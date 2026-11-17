// All communication with the Express backend goes through this one fetch helper.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, method = 'GET', body) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) options.body = JSON.stringify(body);
  let res;
  try {
    res = await fetch(BASE + path, options);
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getBooks: () => request('/books'),
  addBook: (b) => request('/books', 'POST', b),
  updateBook: (id, b) => request(`/books/${id}`, 'PUT', b),
  deleteBook: (id) => request(`/books/${id}`, 'DELETE'),
  getTransactions: () => request('/transactions'),
  addTransaction: (t) => request('/transactions', 'POST', t),
  getUsers: () => request('/users'),
  addUser: (u) => request('/users', 'POST', u),
  updateUser: (id, u) => request(`/users/${id}`, 'PUT', u),
  deleteUser: (id) => request(`/users/${id}`, 'DELETE'),
  login: (creds) => request('/users/login', 'POST', creds),
};
