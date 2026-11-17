export default function TransactionLog({ transactions }) {
  if (!transactions.length) return <p className="empty">No transactions yet. Add or deduct stock above.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Book</th><th>Type</th><th>Qty</th><th>Member</th></tr></thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{new Date(t.created_at).toLocaleString()}</td>
              <td>{t.book_title}</td>
              <td><span className={`badge ${t.type === 'ADD' ? 'badge-ok' : 'badge-low'}`}>{t.type === 'ADD' ? 'Stock added' : 'Borrowed'}</span></td>
              <td>{t.type === 'ADD' ? '+' : '-'}{t.quantity}</td>
              <td>{t.user_name ? `${t.user_name} (${t.membership_id})` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
