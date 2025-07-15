import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/db';
import {
  Home, FileSearch, Bell, AlertCircle, UserCheck,
  BarChart2, LifeBuoy, ClipboardList, LogOut
} from 'lucide-react';

const COLORS = ['#9333ea', '#06b6d4', '#facc15', '#ef4444'];

const styles = {
  container: {
    display: 'flex',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    minHeight: '100vh'
  },
  sidebar: {
    background: '#1e293b',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #334155',
    justifyContent: 'space-between',
    height: '100vh',
    overflowX: 'hidden',
    transition: 'width 0.3s ease'
  },
  sidebarCollapsed: {
    width: '60px'
  },
  sidebarExpanded: {
    width: '250px'
  },
  sidebarMobileExpanded: {
    width: '200px',
    position: 'absolute',
    zIndex: 1000
  },
  hamburgerButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1100,
    background: '#1e293b',
    border: 'none',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#f9fafb'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '14px',
    color: '#cbd5e1',
    transition: 'all 0.2s ease'
  },
  navItemHover: {
    background: 'rgba(147, 51, 234, 0.2)',
    color: '#06b6d4',
    boxShadow: '0 0 10px rgba(6,182,212,0.4)'
  },
  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#ef4444',
    color: '#fff',
    marginTop: 'auto',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  logoutHover: {
    background: '#dc2626'
  },
  main: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#0f172a'
  },
  section: {
    marginBottom: '40px'
  },
  statGrid: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  card: (gradient) => ({
    flex: 1,
    background: gradient,
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 0 30px rgba(0,0,0,0.3)',
    textAlign: 'center',
    color: '#fff',
    minWidth: '200px'
  }),
  chartRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '30px'
  },
  chartBox: {
    flex: 1,
    minWidth: '300px',
    background: '#1e293b',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(255,255,255,0.05)'
  },
  tableSection: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(255,255,255,0.05)',
    color: '#fff',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px'
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '1px solid #334155',
    backgroundColor: '#0f172a'
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #334155'
  },
  selfieImg: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  }
};


export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoverIndex, setHoverIndex] = useState(null);
  const [selectedPage, setSelectedPage] = useState('Dashboard Overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'lostIDs'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data()) }));
        setRecords(data);
      } catch (err) {
        setError('Failed to load records');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const reasonCounts = records.reduce((acc, record) => {
    const reason = record.reason || 'Unknown';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {});
  const totalReasons = Object.values(reasonCounts).reduce((sum, val) => sum + val, 0);
  const reasonData = Object.entries(reasonCounts).map(([name, value]) => ({
    name: `${name} (${((value / totalReasons) * 100).toFixed(1)}%)`,
    value
  }));

  const sortedRecords = [...records].sort((a, b) => new Date(a.dateLost) - new Date(b.dateLost));
  let cumulative = 0;
  const lineData = sortedRecords.map((r) => {
    cumulative++;
    return {
      date: new Date(r.dateLost).toLocaleDateString(),
      total: cumulative
    };
  });

  const dailyStats = records.reduce((acc, record) => {
    const day = new Date(record.dateLost).toLocaleDateString('en-US', { weekday: 'short' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(dailyStats).map(day => ({ name: day, count: dailyStats[day] }));

  const sidebarItems = [
    { label: 'Dashboard Overview', icon: <Home size={18} /> },
    { label: 'Lost ID Reports', icon: <FileSearch size={18} /> },
    { label: 'SAPS Notification', icon: <Bell size={18} /> },
    { label: 'Credit Bureau Alerts', icon: <AlertCircle size={18} /> },
    { label: 'Facial Verification', icon: <UserCheck size={18} /> },
    { label: 'Analytics & Graphs', icon: <BarChart2 size={18} /> },
    { label: 'Support Requests', icon: <LifeBuoy size={18} /> },
    { label: 'System Logs', icon: <ClipboardList size={18} /> }
  ];

  const handleNavigate = (label) => {
    setSelectedPage(label);
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.logo}>Lost ID System</div>
          <div>
            {sidebarItems.map((item, i) => (
              <div
                key={i}
                style={{
                  ...styles.navItem,
                  ...(hoverIndex === i ? styles.navItemHover : {}),
                  ...(selectedPage === item.label ? styles.navItemHover : {})
                }}
                onClick={() => handleNavigate(item.label)}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div
          style={styles.logout}
          onClick={() => alert('Logging out...')}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
        >
          <LogOut size={18} />
          Logout
        </div>
      </aside>

      <main style={styles.main}>
        {selectedPage === 'Dashboard Overview' && (
          <>
            <section style={styles.section}>
              <h2>Overview</h2>
              <div style={styles.statGrid}>
                <div style={styles.card('linear-gradient(135deg,#9333ea,#d946ef)')}>
                  <h3>Total Reports</h3>
                  <p>{records.length}</p>
                </div>
                <div style={styles.card('linear-gradient(135deg,#06b6d4,#3b82f6)')}>
                  <h3>Unique Reasons</h3>
                  <p>{reasonData.length}</p>
                </div>
              </div>
            </section>

            <section style={styles.section}>
              <h2>Analytics</h2>
              <div style={styles.chartRow}>
                <div style={styles.chartBox}>
                  <h3>Total Reports Over Time</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#06b6d4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.chartBox}>
                  <h3>Lost ID Reasons</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={reasonData} dataKey="value" cx="50%" cy="50%" outerRadius={90} label>
                        {reasonData.map((entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.chartBox}>
                  <h3>Reports Per Weekday</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </>
        )}

        {selectedPage === 'Lost ID Reports' && (
          <section style={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Lost ID Reports</h2>
              <div style={{
                position: 'relative',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                color: '#cbd5e1'
              }}>
                <FileSearch size={16} style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Search by name or ID"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <div style={styles.tableSection}>
              {loading && <p>Loading...</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {!loading && !error && (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Surname</th>
                      <th style={styles.th}>ID Number</th>
                      <th style={styles.th}>Date Lost</th>
                      <th style={styles.th}>Reason</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Used At</th>
                      <th style={styles.th}>Selfie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .filter(record =>
                        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        record.idNumber.includes(searchTerm)
                      )
                      .map(record => (
                        <tr key={record.id}>
                          <td style={styles.td}>{record.name}</td>
                          <td style={styles.td}>{record.surname}</td>
                          <td style={styles.td}>{record.idNumber}</td>
                          <td style={styles.td}>{record.dateLost}</td>
                          <td style={styles.td}>{record.reason}</td>
                          <td style={styles.td}>{record.usedAtShop ? 'Used' : 'Not Used'}</td>
                          <td style={styles.td}>{record.usedAtShop ? `${record.usedAtShop} (${record.usedDate})` : '-'}</td>
                          <td style={styles.td}>{record.selfieBase64 ? <img src={record.selfieBase64} alt="Selfie" style={styles.selfieImg} /> : '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
