import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BooksPage from './pages/BooksPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/books" element={<Protected><BooksPage /></Protected>} />
          <Route path="/transactions" element={<Protected><TransactionsPage /></Protected>} />
          <Route path="/users" element={<Protected><UsersPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
