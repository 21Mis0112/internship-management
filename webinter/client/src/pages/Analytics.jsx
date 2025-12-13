import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import api from '../api';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [drillDownData, setDrillDownData] = useState(null);
    const [drillDownType, setDrillDownType] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/analytics');
            setAnalyticsData(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setError('Failed to fetch analytics data');
            setLoading(false);
        }
    };

    const handleChartClick = async (filterType, value) => {
        try {
            setDrillDownType(`${filterType}: ${value}`);
            const params = new URLSearchParams();
            params.append(filterType, value);

            const res = await api.get(`/candidates?${params.toString()}`);
            setDrillDownData(res.data);
        } catch (err) {
            console.error('Failed to fetch drill-down data:', err);
        }
    };

    const clearDrillDown = () => {
        setDrillDownData(null);
        setDrillDownType(null);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Loading analytics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: 'red', fontSize: '1.25rem' }}>{error}</div>
                <button className="btn btn-primary" onClick={fetchAnalytics} style={{ marginTop: '1rem' }}>
                    Retry
                </button>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ color: 'var(--text-muted)' }}>No data available</div>
            </div>
        );
    }

    // Chart data with click handlers
    const statusChartData = {
        labels: analyticsData.statusDistribution.map(d => d.status),
        datasets: [{
            label: 'Candidates',
            data: analyticsData.statusDistribution.map(d => d.count),
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(251, 191, 36, 0.8)',
            ],
            borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(168, 85, 247, 1)',
                'rgba(251, 191, 36, 1)',
            ],
            borderWidth: 2,
        }]
    };

    const deptChartData = {
        labels: analyticsData.departmentBreakdown.map(d => d.department),
        datasets: [{
            label: 'Candidates per Department',
            data: analyticsData.departmentBreakdown.map(d => d.count),
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            borderColor: 'rgba(168, 85, 247, 1)',
            borderWidth: 2,
        }]
    };

    const yearChartData = {
        labels: analyticsData.yearlyTrends.map(d => d.year),
        datasets: [{
            label: 'Candidates per Year',
            data: analyticsData.yearlyTrends.map(d => d.count),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
        }]
    };

    const collegeChartData = {
        labels: analyticsData.collegeDistribution.map(d => d.college),
        datasets: [{
            label: 'Candidates',
            data: analyticsData.collegeDistribution.map(d => d.count),
            backgroundColor: [
                'rgba(251, 191, 36, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(20, 184, 166, 0.8)',
                'rgba(249, 115, 22, 0.8)',
                'rgba(99, 102, 241, 0.8)',
                'rgba(14, 165, 233, 0.8)',
            ],
            borderColor: [
                'rgba(251, 191, 36, 1)',
                'rgba(34, 197, 94, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(239, 68, 68, 1)',
                'rgba(168, 85, 247, 1)',
                'rgba(236, 72, 153, 1)',
                'rgba(20, 184, 166, 1)',
                'rgba(249, 115, 22, 1)',
                'rgba(99, 102, 241, 1)',
                'rgba(14, 165, 233, 1)',
            ],
            borderWidth: 2,
        }]
    };

    // Chart options with onClick
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#e5e7eb', font: { size: 12 } } },
            title: { display: false },
        },
        scales: {
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
            x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        }
    };

    const barOptionsWithClick = (filterType) => ({
        responsive: true,
        maintainAspectRatio: true,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const value = filterType === 'department'
                    ? analyticsData.departmentBreakdown[index].department
                    : analyticsData.collegeDistribution[index].college;
                handleChartClick(filterType, value);
            }
        },
        plugins: {
            legend: { position: 'bottom', labels: { color: '#e5e7eb', font: { size: 12 } } },
            title: { display: false },
        },
        scales: {
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
            x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        }
    });

    const pieOptionsWithClick = (filterType) => ({
        responsive: true,
        maintainAspectRatio: true,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const value = filterType === 'status'
                    ? analyticsData.statusDistribution[index].status
                    : analyticsData.collegeDistribution[index].college;
                handleChartClick(filterType, value);
            }
        },
        plugins: {
            legend: { position: 'bottom', labels: { color: '#e5e7eb', font: { size: 12 } } },
        }
    });

    const yearOptionsWithClick = {
        responsive: true,
        maintainAspectRatio: true,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const year = analyticsData.yearlyTrends[index].year;
                handleChartClick('year', year);
            }
        },
        plugins: {
            legend: { position: 'bottom', labels: { color: '#e5e7eb', font: { size: 12 } } },
            title: { display: false },
        },
        scales: {
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
            x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        }
    };


    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Analytics Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Click on any chart segment to see candidates</p>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                {/* Status Distribution */}
                {analyticsData.statusDistribution.length > 0 && (
                    <div className="glass-panel" style={{ cursor: 'pointer' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>📊 Status Distribution</h3>
                        <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Pie data={statusChartData} options={pieOptionsWithClick('status')} />
                        </div>
                    </div>
                )}

                {/* Department Breakdown */}
                {analyticsData.departmentBreakdown.length > 0 && (
                    <div className="glass-panel" style={{ cursor: 'pointer' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>📊 Top Departments</h3>
                        <div style={{ height: '300px' }}>
                            <Bar data={deptChartData} options={barOptionsWithClick('department')} />
                        </div>
                    </div>
                )}

                {/* Yearly Trends - Bar Chart */}
                {analyticsData.yearlyTrends.length > 0 && (
                    <div className="glass-panel" style={{ cursor: 'pointer' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>📊 Candidates by Year</h3>
                        <div style={{ height: '300px' }}>
                            <Bar data={yearChartData} options={yearOptionsWithClick} />
                        </div>
                    </div>
                )}
            </div>

            {/* Drill-Down Results */}
            {drillDownData && (
                <div className="glass-panel animate-fade-in" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Candidates - {drillDownType} ({drillDownData.length})</h2>
                        <button className="btn btn-secondary" onClick={clearDrillDown}>✕ Clear</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>College</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drillDownData.map(candidate => (
                                    <tr key={candidate.id}>
                                        <td>{candidate.intern_id || '-'}</td>
                                        <td>{candidate.name}</td>
                                        <td>{candidate.email}</td>
                                        <td>{candidate.college || '-'}</td>
                                        <td>{candidate.department || '-'}</td>
                                        <td>
                                            <span className={`badge ${candidate.status === 'Active' ? 'badge-green' :
                                                candidate.status === 'Completed' ? 'badge-blue' : 'badge-red'}`}>
                                                {candidate.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
                                                onClick={() => navigate(`/candidate/${candidate.id}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
