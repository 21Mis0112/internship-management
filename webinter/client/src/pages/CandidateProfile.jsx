import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function CandidateProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState(null);
    const [isExtending, setIsExtending] = useState(false);
    const [extensionData, setExtensionData] = useState({ new_end_date: '', reason: '' });

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/candidates/${id}`);
            setCandidate(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExtend = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/candidates/${id}/extend`, extensionData);
            setIsExtending(false);
            fetchProfile();
        } catch (err) {
            alert('Failed to extend');
        }
    };

    if (!candidate) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                &larr; Back to Dashboard
            </button>

            <div className="glass-panel animate-fade-in" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>{candidate.name}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{candidate.email}</p>
                        {candidate.intern_id && <p style={{ color: 'var(--primary)', fontWeight: 600 }}>ID: {candidate.intern_id}</p>}
                    </div>
                    <span className={`badge ${candidate.status === 'Active' ? 'badge-green' :
                        candidate.status === 'Completed' ? 'badge-blue' :
                            candidate.status === 'Disconnected' ? 'badge-red' : 'badge-gray'
                        }`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                        {candidate.status}
                    </span>
                </div>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Academic Details</h3>
                        <p><strong>College:</strong> {candidate.college || '-'}</p>
                        <p><strong>Department:</strong> {candidate.department || '-'}</p>
                        <p><strong>Qualification:</strong> {candidate.qualification || '-'}</p>
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Internship Duration</h3>
                        <p><strong>Start:</strong> {candidate.start_date}</p>
                        <p><strong>End:</strong> {candidate.end_date}</p>
                    </div>
                    <div>
                        <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Contact & Reference</h3>
                        <p><strong>Phone:</strong> {candidate.phone}</p>
                        <p><strong>Mentor:</strong> {candidate.mentor || '-'}</p>
                        <p><strong>Referred By:</strong> {candidate.referred_by || '-'}</p>
                    </div>
                </div>

                <hr style={{ margin: '2rem 0', borderColor: 'var(--border)' }} />

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Internship Actions</h3>
                        {!isExtending && (
                            <button className="btn btn-secondary" onClick={() => setIsExtending(true)}>
                                Extend Duration
                            </button>
                        )}
                    </div>

                    {isExtending && (
                        <form onSubmit={handleExtend} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="label">New End Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="input"
                                        value={extensionData.new_end_date}
                                        onChange={e => setExtensionData({ ...extensionData, new_end_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="label">Reason</label>
                                    <input
                                        required
                                        className="input"
                                        placeholder="Why extending?"
                                        value={extensionData.reason}
                                        onChange={e => setExtensionData({ ...extensionData, reason: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsExtending(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Extension</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
