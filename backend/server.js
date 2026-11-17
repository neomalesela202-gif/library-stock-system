require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const app = express();
app.use(cors());          // allow the React app (another origin) to call this API
app.use(express.json());  // parse JSON request bodies

app.get('/', (req, res) => res.json({ status: 'Library API running' }));
app.use('/books', require('./routes/books'));
app.use('/transactions', require('./routes/transactions'));
app.use('/users', require('./routes/users'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Central error handler: turns database errors into readable messages
app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That ISBN or membership ID already exists' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((e) => { console.error('Database setup failed:', e.code, e.message); process.exit(1); });
