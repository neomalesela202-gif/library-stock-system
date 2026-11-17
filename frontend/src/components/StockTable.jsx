export const LOW_STOCK = 2; // fewer than 2 copies counts as low stock

export default function StockTable({ books }) {
  if (!books.length) return <p className="empty">No books in the library yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Available</th><th>Status</th></tr></thead>
        <tbody>
          {books.map((b) => {
            const low = b.quantity < LOW_STOCK;
            return (
              <tr key={b.id} className={low ? 'low' : ''}>
                <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.quantity}</td>
                <td>{low ? <span className="badge badge-low">{b.quantity === 0 ? 'Out of stock' : 'Low stock'}</span> : <span className="badge badge-ok">In stock</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
