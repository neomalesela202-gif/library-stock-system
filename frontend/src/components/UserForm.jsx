import { useState, useEffect } from 'react';
import Message from './Message.jsx';

const EMPTY = { name: '', membership_id: '', role: 'member', password: '' };

export default function UserForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    setForm(editing ? { ...editing, password: '' } : EMPTY);
    setErrors({});
    setServerError('');
  }, [editing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.membership_id.trim()) e.membership_id = 'Membership ID is required';
    if (!editing && form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (editing && form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters';
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

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{editing ? 'Update user' : 'Add a new user'}</h2>
      <div className="grid-2">
        <label>Name
          <input name="name" value={form.name} onChange={handleChange} />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label>Membership ID
          <input name="membership_id" value={form.membership_id} onChange={handleChange} />
          {errors.membership_id && <span className="field-error">{errors.membership_id}</span>}
        </label>
        <label>Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label>{editing ? 'New password (leave blank to keep)' : 'Password'}
          <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
      </div>
      <Message error={serverError} />
      <div className="row">
        <button className="btn">{editing ? 'Save changes' : 'Add user'}</button>
        {editing && <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
