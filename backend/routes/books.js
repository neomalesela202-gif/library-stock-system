const express = require('express');
const { pool } = require('../db');
const router = express.Router();

function validate(b, requireQty) {
  const errors = [];
  for (const f of ['title', 'author', 'genre', 'isbn']) {
    if (!b[f] || !String(b[f]).trim()) errors.push(`${f} is required`);
  }
  if (b.isbn && !/^[0-9Xx-]{10,17}$/.test(String(b.isbn).trim())) errors.push('isbn must be 10-17 digits (hyphens allowed)');
  if (requireQty) {
    const q = Number(b.quantity);
    if (!Number.isInteger(q) || q < 0) errors.push('quantity must be a whole number, 0 or more');
  }
  return errors;
}

// READ all
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (e) { next(e); }
});

// READ one
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// CREATE (initial quantity is also logged as an ADD transaction)
router.post('/', async (req, res, next) => {
  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  const { title, author, genre, isbn } = req.body;
  const quantity = Number(req.body.quantity);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?,?,?,?,?)',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), quantity]);
    if (quantity > 0) await conn.query(
      "INSERT INTO transactions (book_id, type, quantity) VALUES (?, 'ADD', ?)", [r.insertId, quantity]);
    await conn.commit();
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { await conn.rollback(); next(e); } finally { conn.release(); }
});

// UPDATE details (stock changes go through /transactions so history stays accurate)
router.put('/:id', async (req, res, next) => {
  const errors = validate(req.body, false);
  if (errors.length) return res.status(400).json({ error: errors.join(', ') });
  const { title, author, genre, isbn } = req.body;
  try {
    const [r] = await pool.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=? WHERE id=?',
      [title.trim(), author.trim(), genre.trim(), isbn.trim(), req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Book not found' });
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    const [r] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
