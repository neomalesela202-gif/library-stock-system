import { Navigate, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="narrow">
      <LoginForm onSuccess={(u) => { login(u); navigate('/'); }} />
      <p className="hint">First time? Log in with membership ID ADMIN001 and password admin123, then add users.</p>
    </div>
  );
}
