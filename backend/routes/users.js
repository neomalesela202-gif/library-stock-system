const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const router = express.Router();

const ROLES = ['admin', 'librarian', 'member'];
const PUBLIC = 'id, name, membership_id, role, created_at';

function validate(u, passwordRequired) {
  const errors = [];
  if (!u.name || !u.name.trim()) errors.push('name is required');
  if (!u.membership_id || !u.membership_id.trim()) errors.push('membership_id is required');
  if (!ROLES.includes(u.role)) errors.push('role must be admin, librarian or member');
  if (passwordRequired && (!u.password || u.password.length < 6)) errors.push('password must be at least 6 characters');
  if (!passwordRequired && u.password && u.password.length < 6) errors.push('password must be at least 6 characters');
  return errors;
}

// LOGIN
router.post('/login', async (req, res, next) => {
  try {
    const { membership_id, password } = req.body;
    if (!membership_id || !password) return res.status(400).json({ error: 'Enter your membership ID and password' });
    const [rows] = await pool.query('SELECT * FROM users WHERE membership_id = ?', [membership_id.trim()]);
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash)))
      return res.status(401).json({ error: 'Incorrect membership ID or password' });
    const { password_hash, ...user } = rows[0];
    res.json(user);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT ${PUBLIC} FROM users ORDER BY name`);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const [r] = await pool.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?,?,?,?)',
      [req.body.name.trim(), req.body.membership_id.trim(), req.body.role, hash]);
    const [rows] = await pool.query(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  const errors = validate(req.body, false);
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  try {
    const fields = ['name=?', 'membership_id=?', 'role=?'];
    const params = [req.body.name.trim(), req.body.membership_id.trim(), req.body.role];
    if (req.body.password) { fields.push('password_hash=?'); params.push(await bcrypt.hash(req.body.password, 10)); }
    params.push(req.params.id);
    const [r] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, params);
    if (!r.affectedRows) return res.status(404).json({ error: 'User not found' });
    const [rows] = await pool.query(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
