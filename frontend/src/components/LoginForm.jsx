import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

export default function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ membership_id: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.membership_id.trim() || !form.password) {
      setError('Enter your membership ID and password');
      return;
    }
    setBusy(true);
    setError('');
    try {
      onSuccess(await api.login(form));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>Log in</h2>
      <label>Membership ID
        <input name="membership_id" value={form.membership_id} onChange={handleChange} autoComplete="username" />
      </label>
      <label>Password
        <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
      </label>
      <Message error={error} />
      <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
    </form>
  );
}
