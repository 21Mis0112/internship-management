import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AddCandidate() {
    const [activeTab, setActiveTab] = useState('manual'); // manual | upload
    const navigate = useNavigate();

    // Manual Form State
    const [formData, setFormData] = useState({
        intern_id: '',
        name: '',
        college: '',
        department: '',
        start_date: '',
        end_date: '',
        email: '',
        phone: '',
        mentor: '',
        referred_by: '',
        qualification: '',
        status: 'Active'
    });

    // Upload State
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/candidates', formData);
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
            console.error('Error adding candidate:', errorMsg);
            alert('Error adding candidate: ' + errorMsg);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const data = new FormData();
        data.append('file', file);

        try {
            setUploadStatus('Uploading...');
            const res = await api.post('/candidates/upload', data);
            setUploadStatus(res.data.message);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setUploadStatus('Upload failed: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('manual')}
                >
                    Manual Entry
                </button>
                <button
                    className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('upload')}
                >
                    Excel Import
                </button>
            </div>

            <div className="glass-panel animate-fade-in">
                {activeTab === 'manual' ? (
                    <form onSubmit={handleManualSubmit}>
                        <h2 style={{ marginBottom: '1.5rem' }}>New Application</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                            <div className="form-group">
                                <label className="label">Intern ID</label>
                                <input className="input" value={formData.intern_id} onChange={e => setFormData({ ...formData, intern_id: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Full Name *</label>
                                <input required className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="label">Email *</label>
                                <input required type="email" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Phone *</label>
                                <input required className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="label">College Name</label>
                                <input className="input" value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Department</label>
                                <input className="input" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="label">Qualification *</label>
                                <input required className="input" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="label">Start Date</label>
                                <input type="date" className="input" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">End Date</label>
                                <input type="date" className="input" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="label">Mentor</label>
                                <input className="input" value={formData.mentor} onChange={e => setFormData({ ...formData, mentor: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="label">Referred By</label>
                                <input className="input" value={formData.referred_by} onChange={e => setFormData({ ...formData, referred_by: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label className="label">Status</label>
                                <select className="input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Disconnected">Disconnected</option>
                                </select>
                            </div>

                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary">Save Candidate</button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleFileUpload} style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Upload Candidates Excel</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                            Expected Columns: <br />
                            <code>ID NO.</code>, <code>NAME</code>, <code>COLLEGE NAME</code>, <code>DEPARTMENT</code>, <code>STARTING DATE</code>, <code>ENDING DATE</code>, <code>PHONE NO</code>, <code>STATUS</code>, <code>MENTOR</code>, <code>REFERRED BY</code>, <code>MAIL ID</code>
                        </p>

                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ marginBottom: '2rem' }}
                        />

                        <div>
                            <button type="submit" disabled={!file} className="btn btn-primary">
                                Upload & Import
                            </button>
                        </div>
                        {uploadStatus && <div style={{ marginTop: '1rem', fontWeight: 600 }}>{uploadStatus}</div>}
                    </form>
                )}
            </div>
        </div>
    );
}
