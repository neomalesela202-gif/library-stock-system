import { useState, useEffect } from 'react';
import { api } from '../api.js';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';
import Message from '../components/Message.jsx';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.getBooks().then(setBooks).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (form) => {
    if (editing) {
      await api.updateBook(editing.id, form);
      setEditing(null);
      setSuccess('Book updated');
    } else {
      await api.addBook(form);
      setSuccess('Book added');
    }
    setError('');
    load();
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? Its transaction history will be removed too.`)) return;
    try {
      await api.deleteBook(book.id);
      if (editing && editing.id === book.id) setEditing(null);
      setError('');
      setSuccess('Book deleted');
      load();
    } catch (e) {
      setSuccess('');
      setError(e.message);
    }
  };

  return (
    <>
      <h1>Book management</h1>
      <BookForm editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
      <Message error={error} success={success} />
      <BookList books={books} onEdit={(b) => { setEditing(b); setSuccess(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={handleDelete} />
    </>
  );
}
