import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Attendance = () => {
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      fetchAttendanceForDate();
    }
  }, [selectedDate, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('Token from localStorage:', token ? 'exists' : 'missing');

      console.log('Token from localStorage:', token ? 'exists' : 'missing');

      const response = await api.get(`/application/approved-students`);

      console.log('API response:', response.data);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      showMessage('Failed to load students with approved applications', 'error');
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async () => {
    try {
      const response = await api.get(`/attendance/${selectedDate}`);
      const attendanceMap = {};

      response.data.forEach((record) => {
        attendanceMap[record.intern] = record.status;
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      showMessage('Failed to load attendance records', 'error');
    }
  };

  const markAttendance = async (internId, status) => {
    try {
      setLoading(true);
      await api.post(`/attendance`, {
        intern: internId,
        date: selectedDate,
        status: status,
      });

      setAttendance({ ...attendance, [internId]: status });
      showMessage(`Marked as ${status}`, 'success');
      setLoading(false);
    } catch (error) {
      console.error('Error marking attendance:', error);
      showMessage('Failed to mark attendance', 'error');
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const calculateStats = () => {
    const total = users.length;
    const present = Object.values(attendance).filter((s) => s === 'Present').length;
    const absent = Object.values(attendance).filter((s) => s === 'Absent').length;
    const notMarked = total - present - absent;
    return { total, present, absent, notMarked };
  };

  const stats = calculateStats();

  if (loading && users.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Total Participants</h1>
          <p style={styles.subtitle}>Students with approved assignments only</p>
        </div>
        <div style={styles.dateSelector}>
          <label htmlFor="date-input" style={styles.dateLabel}>
            Select Date
          </label>
          <input
            id="date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {message.text && (
        <div style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.messageSuccess : styles.messageError)
        }}>
          <span style={styles.messageIcon}>
            {message.type === 'success' ? '✓' : '✕'}
          </span>
          {message.text}
        </div>
      )}

      {users.length > 0 && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total</div>
            </div>
          </div>
          <div style={{ ...styles.statCard, ...styles.statCardPresent }}>
            <div style={styles.statIcon}>✓</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.present}</div>
              <div style={styles.statLabel}>Present</div>
            </div>
          </div>
          <div style={{ ...styles.statCard, ...styles.statCardAbsent }}>
            <div style={styles.statIcon}>✕</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.absent}</div>
              <div style={styles.statLabel}>Absent</div>
            </div>
          </div>
          <div style={{ ...styles.statCard, ...styles.statCardPending }}>
            <div style={styles.statIcon}>⏱</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.notMarked}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Attendance for Approved Students</h2>
          <div style={styles.tableMeta}>
            Only students with approved assignments appear in this list
          </div>
        </div>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={{ ...styles.th, width: '60px' }}>S.No</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={{ ...styles.th, width: '140px' }}>Status</th>
                <th style={{ ...styles.th, width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.noData}>
                    <div style={styles.noDataContent}>
                      <div style={styles.noDataIcon}>📭</div>
                      <div>No users found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const userId = user._id;
                  const currentStatus = attendance[userId] || 'Not Marked';

                  return (
                    <tr key={userId} style={styles.tableRow}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={{ ...styles.td, fontWeight: '500' }}>{user.name || 'N/A'}</td>
                      <td style={{ ...styles.td, color: '#64748b' }}>{user.email || 'N/A'}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          ...(currentStatus === 'Present' ? styles.statusPresent :
                            currentStatus === 'Absent' ? styles.statusAbsent :
                              styles.statusPending)
                        }}>
                          {currentStatus === 'Present' ? '✓ ' :
                            currentStatus === 'Absent' ? '✕ ' : '⏱ '}
                          {currentStatus}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => markAttendance(userId, 'Present')}
                            disabled={loading || currentStatus === 'Present'}
                            style={{
                              ...styles.btn,
                              ...styles.btnPresent,
                              ...(currentStatus === 'Present' && styles.btnDisabled)
                            }}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(userId, 'Absent')}
                            disabled={loading || currentStatus === 'Absent'}
                            style={{
                              ...styles.btn,
                              ...styles.btnAbsent,
                              ...(currentStatus === 'Absent' && styles.btnDisabled)
                            }}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  header: {
    background: 'white',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  headerContent: {
    flex: '1',
    minWidth: '250px',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '2rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #00115dff 0%, #01068aff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.95rem',
  },
  dateSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  dateLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#475569',
  },
  dateInput: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  message: {
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    animation: 'slideIn 0.3s ease-out',
  },
  messageSuccess: {
    background: '#d1fae5',
    color: '#065f46',
    border: '2px solid #6ee7b7',
  },
  messageError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '2px solid #fca5a5',
  },
  messageIcon: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  statCardPresent: {
    borderLeft: '4px solid #10b981',
  },
  statCardAbsent: {
    borderLeft: '4px solid #ef4444',
  },
  statCardPending: {
    borderLeft: '4px solid #f59e0b',
  },
  statIcon: {
    fontSize: '2rem',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '1.5rem 2rem',
    borderBottom: '2px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  tableTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  tableMeta: {
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadRow: {
    background: '#f8fafc',
  },
  th: {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0',
  },
  tableRow: {
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '1.25rem 1.5rem',
    fontSize: '0.95rem',
    color: '#334155',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.4rem 0.9rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.3px',
  },
  statusPresent: {
    background: '#d1fae5',
    color: '#065f46',
  },
  statusAbsent: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  statusPending: {
    background: '#fef3c7',
    color: '#92400e',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  btn: {
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  btnPresent: {
    background: '#10b981',
    color: 'white',
  },
  btnAbsent: {
    background: '#ef4444',
    color: 'white',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  noData: {
    padding: '3rem',
    textAlign: 'center',
  },
  noDataContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  noDataIcon: {
    fontSize: '3rem',
  },
};

// Add keyframe animations via a style tag
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  table tbody tr:hover {
    background-color: #f8fafc !important;
  }
  button:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  button:not(:disabled):active {
    transform: translateY(0);
  }
  input[type="date"]:hover {
    border-color: #667eea;
  }
  input[type="date"]:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;
document.head.appendChild(styleSheet);

export default Attendance;
