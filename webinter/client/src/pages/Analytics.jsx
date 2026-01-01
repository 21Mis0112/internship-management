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
    Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
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
    Legend,
    Filler
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
                <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Loading dashboard...</div>
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

    // Calculate KPIs
    const totalCandidates = analyticsData.statusDistribution.reduce((sum, item) => sum + item.count, 0);
    const activeInterns = analyticsData.statusDistribution.find(s => s.status === 'Active')?.count || 0;
    const completedInterns = analyticsData.statusDistribution.find(s => s.status === 'Completed')?.count || 0;
    const disconnectedInterns = analyticsData.statusDistribution.find(s => s.status === 'Disconnected')?.count || 0;
    const topDepartment = analyticsData.departmentBreakdown[0]?.department || 'N/A';
    const topDeptCount = analyticsData.departmentBreakdown[0]?.count || 0;
    const topCollege = analyticsData.collegeDistribution[0]?.college || 'N/A';
    const topCollegeCount = analyticsData.collegeDistribution[0]?.count || 0;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const thisYearCount = analyticsData.yearlyTrends.find(y => y.year === currentYear.toString())?.count || 0;

    // Calculate this month (approximate from yearly data)
    const thisMonthCount = Math.round(thisYearCount / 12); // Simplified estimate

    // Chart configurations
    const statusChartData = {
        labels: analyticsData.statusDistribution.map(d => `${d.status} (${d.count})`),
        datasets: [{
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
        labels: analyticsData.departmentBreakdown.slice(0, 10).map(d => d.department),
        datasets: [{
            label: 'Candidates',
            data: analyticsData.departmentBreakdown.slice(0, 10).map(d => d.count),
            backgroundColor: 'rgba(30, 64, 175, 0.8)',
            borderColor: 'rgba(30, 64, 175, 1)',
            borderWidth: 2,
            borderRadius: 6,
        }]
    };

    const yearChartData = {
        labels: analyticsData.yearlyTrends.map(d => d.year),
        datasets: [{
            label: 'Candidates',
            data: analyticsData.yearlyTrends.map(d => d.count),
            backgroundColor: 'rgba(96, 165, 250, 0.2)',
            borderColor: 'rgba(96, 165, 250, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(96, 165, 250, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
        }]
    };

    const collegeChartData = {
        labels: analyticsData.collegeDistribution.slice(0, 10).map(d => d.college),
        datasets: [{
            label: 'Candidates',
            data: analyticsData.collegeDistribution.slice(0, 10).map(d => d.count),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
            borderRadius: 6,
        }]
    };

    // Chart options
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: true,
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const value = analyticsData.statusDistribution[index].status;
                handleChartClick('status', value);
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#cbd5e1',
                    font: { size: 12 },
                    padding: 15,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const label = analyticsData.statusDistribution[context.dataIndex].status;
                        const value = context.parsed;
                        const percentage = ((value / totalCandidates) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '70%',
    };

    const barOptions = (filterType, dataArray) => ({
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const value = dataArray[index][filterType];
                handleChartClick(filterType, value);
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
            }
        },
        scales: {
            y: {
                ticks: { color: '#9ca3af', font: { size: 11 } },
                grid: { display: false }
            },
            x: {
                ticks: { color: '#9ca3af' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
        }
    });

    const lineOptions = {
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
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#9ca3af' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            x: {
                ticks: { color: '#9ca3af' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>📊 Master Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Comprehensive analytics and insights • Click charts to drill down</p>
            </div>

            {/* KPI Cards - 8 Cards */}
            <div className="kpi-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {/* Total Candidates */}
                <div className="kpi-card glass-panel" style={{ padding: '1.5rem', cursor: 'default' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>👥</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{totalCandidates}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Candidates</div>
                        </div>
                    </div>
                </div>

                {/* Active Interns */}
                <div className="kpi-card glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => handleChartClick('status', 'Active')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{activeInterns}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Active Interns</div>
                        </div>
                    </div>
                </div>

                {/* Completed */}
                <div className="kpi-card glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => handleChartClick('status', 'Completed')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🎓</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{completedInterns}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Completed</div>
                        </div>
                    </div>
                </div>

                {/* Disconnected */}
                <div className="kpi-card glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => handleChartClick('status', 'Disconnected')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>❌</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{disconnectedInterns}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Disconnected</div>
                        </div>
                    </div>
                </div>

                {/* This Year */}
                <div className="kpi-card glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => handleChartClick('year', currentYear.toString())}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📅</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{thisYearCount}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Year {currentYear}</div>
                        </div>
                    </div>
                </div>

                {/* This Month */}
                <div className="kpi-card glass-panel" style={{ padding: '1.5rem', cursor: 'default' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📆</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>{thisMonthCount}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Avg/Month</div>
                        </div>
                    </div>
                </div>

                {/* Top Department */}
                <div className="kpi-card glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => handleChartClick('department', topDepartment)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🏆</span>
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topDepartment}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Top Dept ({topDeptCount})</div>
                        </div>
                    </div>
                </div>

                {/* Top College */}
                <div className="kpi-card glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => handleChartClick('college', topCollege)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>🎓</span>
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topCollege}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Top College ({topCollegeCount})</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

                {/* Status Distribution */}
                {analyticsData.statusDistribution.length > 0 && (
                    <div className="glass-panel" style={{ cursor: 'pointer', position: 'relative' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Status Distribution</h3>
                        <div style={{ height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            <Doughnut data={statusChartData} options={doughnutOptions} />
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                pointerEvents: 'none'
                            }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalCandidates}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Departments */}
                {analyticsData.departmentBreakdown.length > 0 && (
                    <div className="glass-panel" style={{ cursor: 'pointer' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top 10 Departments</h3>
                        <div style={{ height: '350px' }}>
                            <Bar data={deptChartData} options={barOptions('department', analyticsData.departmentBreakdown.slice(0, 10))} />
                        </div>
                    </div>
                )}
            </div>

            {/* Yearly Trends - Full Width */}
            {analyticsData.yearlyTrends.length > 0 && (
                <div className="glass-panel" style={{ marginBottom: '1.5rem', cursor: 'pointer' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Yearly Growth Trend</h3>
                    <div style={{ height: '300px' }}>
                        <Line data={yearChartData} options={lineOptions} />
                    </div>
                </div>
            )}

            {/* Top Colleges */}
            {analyticsData.collegeDistribution.length > 0 && (
                <div className="glass-panel" style={{ marginBottom: '1.5rem', cursor: 'pointer' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top 10 Colleges</h3>
                    <div style={{ height: '350px' }}>
                        <Bar data={collegeChartData} options={barOptions('college', analyticsData.collegeDistribution.slice(0, 10))} />
                    </div>
                </div>
            )}

            {/* Drill-Down Results */}
            {drillDownData && (
                <div className="glass-panel animate-fade-in" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Filtered Candidates - {drillDownType} ({drillDownData.length})</h2>
                        <button className="btn btn-secondary" onClick={clearDrillDown}>✕ Clear Filter</button>
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
                                    <th>Year</th>
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
                                        <td>{candidate.year || '-'}</td>
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
