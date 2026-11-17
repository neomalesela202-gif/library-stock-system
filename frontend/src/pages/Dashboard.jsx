import { useState, useEffect } from 'react';
import { api } from '../api.js';
import StockTable, { LOW_STOCK } from '../components/StockTable.jsx';
import Message from '../components/Message.jsx';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBooks().then(setBooks).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const lowCount = books.filter((b) => b.quantity < LOW_STOCK).length;
  const totalCopies = books.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <>
      <h1>Dashboard</h1>
      <Message error={error} />
      {loading ? <p>Loading books...</p> : (
        <>
          <div className="stats">
            <div className="card stat"><strong>{books.length}</strong><span>Titles</span></div>
            <div className="card stat"><strong>{totalCopies}</strong><span>Copies in stock</span></div>
            <div className={`card stat ${lowCount ? 'stat-low' : ''}`}><strong>{lowCount}</strong><span>Low stock (under {LOW_STOCK} copies)</span></div>
          </div>
          <StockTable books={books} />
        </>
      )}
    </>
  );
}
