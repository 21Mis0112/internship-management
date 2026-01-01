import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        college: '',
        department: '',
        year: '',
        month: '',
        startYear: '',
        endYear: '',
        startDate: '',
        endDate: '',
        search: '', // Matches name, email, or intern_id
    });
    const navigate = useNavigate();

    const [statusOptions, setStatusOptions] = useState([]);

    useEffect(() => {
        fetchCandidates();
        fetchStatusOptions();
    }, [filters]);

    const fetchStatusOptions = async () => {
        try {
            const res = await api.get('/candidates/statuses');
            // Ensure Active, Completed, Disconnected are always there or merge?
            // User requested "directly link with status in data backend".
            // So we show exactly what's in DB + maybe defaults if empty DB?
            // Actually, if DB has data, it shows that. If we just imported, we have Active/Completed etc.
            // Let's trust the DB distinct values as requested.
            setStatusOptions(res.data);
        } catch (err) {
            console.error('Failed to fetch statuses');
        }
    };

    const fetchCandidates = async () => {
        setLoading(true);
        setError(null);
        try {
            const { status, college, department, search, year, month, startYear, endYear, startDate, endDate } = filters;
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (college) params.append('college', college);
            if (department) params.append('department', department);
            if (year) params.append('year', year);
            if (month) params.append('month', month);
            if (startYear) params.append('startYear', startYear);
            if (endYear) params.append('endYear', endYear);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (search) params.append('search', search);

            const res = await api.get(`/candidates?${params.toString()}`);
            console.log('Candidates fetched:', res.data);
            setCandidates(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data. Check if backend is running.');
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/candidates/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'candidates.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error('Export failed', err);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Dashboard ({candidates.length})</h1>
                {error && <div style={{ color: 'red', background: 'rgba(255,0,0,0.1)', padding: '0.5rem' }}>{error}</div>}
                {loading && <div style={{ color: 'yellow' }}>Loading...</div>}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        Export to Excel
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate('/add')}>
                        + Add Candidate
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Filters</h3>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setFilters({ status: '', college: '', department: '', year: '', month: '', startYear: '', endYear: '', startDate: '', endDate: '', search: '' })}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                        Clear All
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {/* Row 1: Search, Status, College */}
                    <div>
                        <label className="label">Search</label>
                        <input
                            className="input"
                            placeholder="Name, Email, or Intern ID..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select
                            className="input"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Statuses</option>
                            {statusOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">College</label>
                        <input
                            className="input"
                            placeholder="Filter by College..."
                            value={filters.college}
                            onChange={(e) => setFilters({ ...filters, college: e.target.value })}
                        />
                    </div>

                    {/* Row 2: Department, Month, Year */}
                    <div>
                        <label className="label">Department</label>
                        <input
                            className="input"
                            placeholder="Filter by Department..."
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Month</label>
                        <select
                            className="input"
                            value={filters.month}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                        >
                            <option value="">All Months</option>
                            <option value="01">January</option>
                            <option value="02">February</option>
                            <option value="03">March</option>
                            <option value="04">April</option>
                            <option value="05">May</option>
                            <option value="06">June</option>
                            <option value="07">July</option>
                            <option value="08">August</option>
                            <option value="09">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Single Year</label>
                        <input
                            className="input"
                            placeholder="Start Year (YYYY)"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        />
                    </div>

                    {/* Row 3: Start Year, End Year, Start Date */}
                    <div>
                        <label className="label">Start Year (Range)</label>
                        <input
                            className="input"
                            type="number"
                            placeholder="From Year (2020)"
                            value={filters.startYear}
                            onChange={(e) => setFilters({ ...filters, startYear: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">End Year (Range)</label>
                        <input
                            className="input"
                            type="number"
                            placeholder="To Year (2024)"
                            value={filters.endYear}
                            onChange={(e) => setFilters({ ...filters, endYear: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="label">Start Date From</label>
                        <input
                            className="input"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        />
                    </div>

                    {/* Row 4: End Date */}
                    <div>
                        <label className="label">Start Date To</label>
                        <input
                            className="input"
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Intern ID</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Dates</th>
                                <th>Mentor</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No candidates found</td>
                                </tr>
                            ) : (
                                candidates.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                                        </td>
                                        <td>{c.intern_id || '-'}</td>
                                        <td>
                                            <div>{c.department}</div>
                                        </td>
                                        <td>{c.start_date ? c.start_date.substring(0, 4) : '-'}</td>
                                        <td>
                                            {c.start_date && <div style={{ fontSize: '0.875rem' }}>Start: {c.start_date}</div>}
                                            {c.end_date && <div style={{ fontSize: '0.875rem' }}>End: {c.end_date}</div>}
                                            {!c.start_date && !c.end_date && '-'}
                                        </td>
                                        <td>{c.mentor || '-'}</td>
                                        <td>
                                            <span className={`badge ${c.status === 'Active' ? 'badge-green' :
                                                c.status === 'Completed' ? 'badge-blue' :
                                                    c.status === 'Disconnected' ? 'badge-red' : 'badge-gray'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                                onClick={() => navigate(`/candidate/${c.id}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
