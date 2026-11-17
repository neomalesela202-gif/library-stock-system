import { useState, useEffect } from 'react';
import Message from './Message.jsx';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '' };

// Used for both adding (no `editing` prop) and updating (`editing` = book being edited).
export default function BookForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    setForm(editing ? { ...editing, quantity: editing.quantity } : EMPTY);
    setErrors({});
    setServerError('');
  }, [editing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.genre.trim()) e.genre = 'Genre is required';
    if (!/^[0-9Xx-]{10,17}$/.test(form.isbn.trim())) e.isbn = 'ISBN must be 10-17 digits (hyphens allowed)';
    if (!editing && !/^\d+$/.test(String(form.quantity))) e.quantity = 'Enter a whole number, 0 or more';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await onSubmit(form);
      if (!editing) setForm(EMPTY);
      setServerError('');
    } catch (err) {
      setServerError(err.message);
    }
  };

  const field = (name, label, type = 'text') => (
    <label>{label}
      <input name={name} type={type} value={form[name]} onChange={handleChange} min={type === 'number' ? 0 : undefined} />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </label>
  );

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{editing ? 'Update book' : 'Add a new book'}</h2>
      <div className="grid-2">
        {field('title', 'Title')}
        {field('author', 'Author')}
        {field('genre', 'Genre')}
        {field('isbn', 'ISBN')}
        {!editing && field('quantity', 'Initial quantity', 'number')}
      </div>
      {editing && <p className="hint">To change stock, use the Transactions page.</p>}
      <Message error={serverError} />
      <div className="row">
        <button className="btn">{editing ? 'Save changes' : 'Add book'}</button>
        {editing && <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
