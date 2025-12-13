import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Get current user from local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("New passwords don't match");
            return;
        }

        try {
            await api.post('/auth/update-password', {
                username: user.username,
                oldPassword,
                newPassword
            });
            setMessage('Password updated successfully!');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update password');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Change Password</h2>
                {message && <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>{message}</div>}
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label className="label">Username</label>
                        <input className="input" type="text" value={user.username || ''} disabled style={{ opacity: 0.7 }} />
                    </div>
                    <div className="form-group">
                        <label className="label">Current Password</label>
                        <input
                            className="input"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">New Password</label>
                        <input
                            className="input"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Confirm New Password</label>
                        <input
                            className="input"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
