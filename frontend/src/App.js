import React, { useEffect, useState } from 'react';
import './App.css';

function UsersApp() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({ username: '', role: 'user' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ username: '', role: 'user' });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (!form.username.trim()) return setError('Username required');

      if (editingId) {
        const res = await fetch(`/api/users/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Create failed');
      }
      await fetchUsers();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(user) {
    setEditingId(user._id || user.id);
    setForm({ username: user.username || user.name || '', role: user.role || 'user' });
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="users-app">
      <h1>Users Management</h1>

      <section className="panel">
        <h2>{editingId ? 'Edit user' : 'Create user'}</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <label>
            Username
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Save' : 'Create'}</button>
            <button type="button" onClick={resetForm}>Cancel</button>
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </section>

      <section className="panel">
        <h2>Users</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id || u.id}>
                  <td>{u.username || u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}</td>
                  <td>
                    <button onClick={() => startEdit(u)}>Edit</button>
                    <button onClick={() => handleDelete(u._id || u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default UsersApp;
