const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// READ history (newest first) with book title and member name
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.type, t.quantity, t.created_at, t.book_id, t.user_id,
             b.title AS book_title, u.name AS user_name, u.membership_id
      FROM transactions t
      JOIN books b ON b.id = t.book_id
      LEFT JOIN users u ON u.id = t.user_id
      ORDER BY t.created_at DESC, t.id DESC`);
    res.json(rows);
  } catch (e) { next(e); }
});

// CREATE: ADD stock or BORROW (deduct) - stock update and log happen together
router.post('/', async (req, res, next) => {
  const { book_id, type, user_id } = req.body;
  const quantity = Number(req.body.quantity);
  if (!book_id) return res.status(400).json({ error: 'book_id is required' });
  if (!['ADD', 'BORROW'].includes(type)) return res.status(400).json({ error: "type must be 'ADD' or 'BORROW'" });
  if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ error: 'quantity must be a whole number of 1 or more' });
  if (type === 'BORROW' && !user_id) return res.status(400).json({ error: 'Choose the member borrowing the book' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const sql = type === 'ADD'
      ? 'UPDATE books SET quantity = quantity + ? WHERE id = ?'
      : 'UPDATE books SET quantity = quantity - ? WHERE id = ? AND quantity >= ?';
    const params = type === 'ADD' ? [quantity, book_id] : [quantity, book_id, quantity];
    const [r] = await conn.query(sql, params);
    if (!r.affectedRows) {
      await conn.rollback();
      const [b] = await pool.query('SELECT quantity FROM books WHERE id = ?', [book_id]);
      if (!b.length) return res.status(404).json({ error: 'Book not found' });
      return res.status(400).json({ error: `Not enough stock. Only ${b[0].quantity} copies available.` });
    }
    const [ins] = await conn.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?,?,?,?)',
      [book_id, type === 'BORROW' ? user_id : null, type, quantity]);
    await conn.commit();
    res.status(201).json({ id: ins.insertId, message: type === 'ADD' ? 'Stock added' : 'Stock deducted' });
  } catch (e) { await conn.rollback(); next(e); } finally { conn.release(); }
});

module.exports = router;
