import { useState, useEffect } from 'react';
import { api } from '../api.js';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionLog from '../components/TransactionLog.jsx';
import Message from '../components/Message.jsx';

export default function TransactionsPage() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const load = () => Promise.all([api.getBooks(), api.getUsers(), api.getTransactions()])
    .then(([b, u, t]) => { setBooks(b); setUsers(u); setTransactions(t); })
    .catch((e) => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (t) => {
    const res = await api.addTransaction(t);
    load(); // refresh stock counts and the history log
    return res;
  };

  return (
    <>
      <h1>Transactions</h1>
      <Message error={error} />
      <TransactionForm books={books} users={users} onSubmit={handleSubmit} />
      <h2>Transaction history</h2>
      <TransactionLog transactions={transactions} />
    </>
  );
}
