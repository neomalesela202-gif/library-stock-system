import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';
import Message from '../components/Message.jsx';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isAdmin = user.role === 'admin';

  const load = () => api.getUsers().then(setUsers).catch((e) => setError(e.message));
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (!isAdmin) {
    return (
      <>
        <h1>User management</h1>
        <p className="card">You are logged in as {user.name} ({user.role}). Only admins can manage users.</p>
      </>
    );
  }

  const handleSubmit = async (form) => {
    if (editing) {
      await api.updateUser(editing.id, form);
      setEditing(null);
      setSuccess('User updated');
    } else {
      await api.addUser(form);
      setSuccess('User added');
    }
    setError('');
    load();
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user ${u.name}?`)) return;
    try {
      await api.deleteUser(u.id);
      if (editing && editing.id === u.id) setEditing(null);
      setError('');
      setSuccess('User deleted');
      load();
    } catch (e) {
      setSuccess('');
      setError(e.message);
    }
  };

  return (
    <>
      <h1>User management</h1>
      <UserForm editing={editing} onSubmit={handleSubmit} onCancel={() => setEditing(null)} />
      <Message error={error} success={success} />
      <UserList users={users} currentUserId={user.id} onEdit={(u) => { setEditing(u); setSuccess(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} onDelete={handleDelete} />
    </>
  );
}
