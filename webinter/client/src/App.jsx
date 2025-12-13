import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddCandidate from './pages/AddCandidate';
import CandidateProfile from './pages/CandidateProfile';
import ChangePassword from './pages/ChangePassword';
import Analytics from './pages/Analytics';

const ProtectedLayout = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>RNPAIL</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span>Welcome, {user.username}</span>
          <Link to="/analytics" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Analytics</Link>
          <Link to="/add" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Add Candidate</Link>
          <Link to="/change-password" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Change Password</Link>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="container animate-fade-in">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/add" element={<AddCandidate />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/candidate/:id" element={<CandidateProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
