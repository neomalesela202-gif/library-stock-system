require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const { execSync } = require('child_process');

const cfg = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};
const DB_NAME = process.env.DB_NAME || 'library_db';

// The routes use `pool`; it is connected to the real MySQL pool once the port is found.
let realPool;
const pool = {
  query: (...args) => realPool.query(...args),
  getConnection: () => realPool.getConnection(),
};

// On Windows, ask the system which ports the running mysqld.exe is listening on.
function portsFromWindows() {
  try {
    const tasks = execSync('tasklist /FI "IMAGENAME eq mysqld.exe" /FO CSV /NH', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const pids = [...tasks.matchAll(/"mysqld\.exe","(\d+)"/gi)].map((m) => m[1]);
    if (!pids.length) return [];
    const net = execSync('netstat -ano -p tcp', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const ports = [];
    for (const line of net.split(/\r?\n/)) {
      const p = line.trim().split(/\s+/);
      if (p[3] === 'LISTENING' && pids.includes(p[4])) ports.push(Number(p[1].split(':').pop()));
    }
    return ports;
  } catch {
    return [];
  }
}

// True if a real MySQL server answers on this port (a wrong password still counts as "found").
async function isMysql(port) {
  try {
    const c = await mysql.createConnection({ ...cfg, port, connectTimeout: 2000 });
    await c.end();
    return true;
  } catch (e) {
    return e.errno === 1045; // access denied = MySQL is there, only the password is wrong
  }
}

async function findPort() {
  const wanted = [process.env.DB_PORT, ...portsFromWindows(), 3306, 3307, 3308, 3309, 3310, 3305]
    .map(Number)
    .filter((p) => p && p !== 33060 && p !== 33061); // 33060 is MySQL's X Protocol port, not usable here
  for (const port of [...new Set(wanted)]) {
    if (await isMysql(port)) {
      console.log(`Found MySQL on port ${port}`);
      return port;
    }
  }
  throw new Error('Could not find MySQL. Start the MySQL96 service (services.msc), then try again.');
}

// Creates the database, tables and starter data the first time the server runs.
async function initDb() {
  cfg.port = await findPort();
  realPool = mysql.createPool({ ...cfg, database: DB_NAME, waitForConnections: true, connectionLimit: 10 });

  const conn = await mysql.createConnection(cfg);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await conn.end();

  await pool.query(`CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    membership_id VARCHAR(50) NOT NULL UNIQUE,
    role ENUM('admin','librarian','member') NOT NULL DEFAULT 'member',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NULL,
    type ENUM('ADD','BORROW') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`);

  const [[{ n: userCount }]] = await pool.query('SELECT COUNT(*) AS n FROM users');
  if (userCount === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?,?,?,?)',
      ['Administrator', 'ADMIN001', 'admin', hash]
    );
  }
  const [[{ n: bookCount }]] = await pool.query('SELECT COUNT(*) AS n FROM books');
  if (bookCount === 0) {
    const sample = [
      ['Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5],
      ['Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 1],
      ['A Brief History of Time', 'Stephen Hawking', 'Science', '9780553380163', 3],
      ['Long Walk to Freedom', 'Nelson Mandela', 'Biography', '9780316548182', 0],
    ];
    for (const [t, a, g, i, q] of sample) {
      const [r] = await pool.query(
        'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?,?,?,?,?)', [t, a, g, i, q]);
      if (q > 0) await pool.query(
        "INSERT INTO transactions (book_id, type, quantity) VALUES (?, 'ADD', ?)", [r.insertId, q]);
    }
  }
}

module.exports = { pool, initDb };
