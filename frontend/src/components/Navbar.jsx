import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="navbar">
      <span className="brand">Library Stock</span>
      {user && (
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/books">Books</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <NavLink to="/users">Users</NavLink>
        </nav>
      )}
      {user && (
        <div className="who">
          <span>{user.name} ({user.role})</span>
          <button className="btn btn-light" onClick={handleLogout}>Log out</button>
        </div>
      )}
    </header>
  );
}
