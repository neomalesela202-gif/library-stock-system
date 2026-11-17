export default function BookList({ books, onEdit, onDelete }) {
  if (!books.length) return <p className="empty">No books yet. Add your first book using the form.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>In stock</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.isbn}</td><td>{b.quantity}</td>
              <td className="actions">
                <button className="btn btn-small" onClick={() => onEdit(b)}>Update</button>
                <button className="btn btn-small btn-danger" onClick={() => onDelete(b)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
