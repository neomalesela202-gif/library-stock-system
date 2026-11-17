import { useState } from 'react';
import Message from './Message.jsx';

// Two submit buttons: "Add stock" (ADD) and "Deduct stock" (BORROW).
export default function TransactionForm({ books, users, onSubmit }) {
  const [form, setForm] = useState({ book_id: '', quantity: '1', user_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (type) => {
    setSuccess('');
    if (!form.book_id) return setError('Choose a book');
    if (!/^[1-9]\d*$/.test(form.quantity)) return setError('Quantity must be a whole number of 1 or more');
    if (type === 'BORROW' && !form.user_id) return setError('Choose the member borrowing the book');
    try {
      const res = await onSubmit({ book_id: Number(form.book_id), type, quantity: Number(form.quantity), user_id: form.user_id ? Number(form.user_id) : null });
      setError('');
      setSuccess(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card form" onSubmit={(e) => e.preventDefault()} noValidate>
      <h2>Record stock movement</h2>
      <div className="grid-2">
        <label>Book
          <select name="book_id" value={form.book_id} onChange={handleChange}>
            <option value="">Select a book</option>
            {books.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.quantity} in stock)</option>)}
          </select>
        </label>
        <label>Quantity
          <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} />
        </label>
        <label>Member (needed when deducting)
          <select name="user_id" value={form.user_id} onChange={handleChange}>
            <option value="">Select a member</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}
          </select>
        </label>
      </div>
      <Message error={error} success={success} />
      <div className="row">
        <button type="button" className="btn" onClick={() => submit('ADD')}>Add stock</button>
        <button type="button" className="btn btn-warn" onClick={() => submit('BORROW')}>Deduct stock (borrow)</button>
      </div>
    </form>
  );
}
