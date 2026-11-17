export default function UserList({ users, currentUserId, onEdit, onDelete }) {
  if (!users.length) return <p className="empty">No users yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td><td>{u.membership_id}</td><td>{u.role}</td>
              <td className="actions">
                <button className="btn btn-small" onClick={() => onEdit(u)}>Update</button>
                <button className="btn btn-small btn-danger" disabled={u.id === currentUserId} onClick={() => onDelete(u)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
