import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldAlert, Users, FileText, Trash2, Database, Activity, CheckCircle, AlertTriangle, ShieldX } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/reports'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (reportsRes.data.success) setReports(reportsRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this landing report from the database?')) {
      try {
        await api.delete(`/admin/reports/${id}`);
        setReports(reports.filter((r) => r._id !== id));
      } catch (err) {
        alert('Failed to delete report.');
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-dark border border-warning text-warning mono-font mb-1">
            ADMINISTRATOR PRIVILEGES ACTIVE
          </span>
          <h2 className="fw-bold brand-heading text-white mb-0">SYSTEM AUDIT CONTROL PANEL</h2>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-info' : 'btn-outline-secondary text-light'}`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn btn-sm ${activeTab === 'users' ? 'btn-info' : 'btn-outline-secondary text-light'}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`btn btn-sm ${activeTab === 'reports' ? 'btn-info' : 'btn-outline-secondary text-light'}`}
          >
            Landing Reports ({reports.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading administrative audit logs...</div>
      ) : (
        <>
          {/* TAB 1: System Overview */}
          {activeTab === 'overview' && stats && (
            <div>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="lunar-card p-3 d-flex align-items-center gap-3">
                    <div className="p-3 rounded-3 bg-dark border border-info text-info">
                      <Users size={26} />
                    </div>
                    <div>
                      <div className="small text-muted uppercase fw-semibold">Registered Users</div>
                      <div className="fs-3 fw-bold mono-font text-white">{stats.totalUsers}</div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="lunar-card p-3 d-flex align-items-center gap-3">
                    <div className="p-3 rounded-3 bg-dark border border-cyan text-cyan">
                      <Database size={26} />
                    </div>
                    <div>
                      <div className="small text-muted uppercase fw-semibold">Uploaded Images</div>
                      <div className="fs-3 fw-bold mono-font text-white">{stats.totalImages}</div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="lunar-card p-3 d-flex align-items-center gap-3">
                    <div className="p-3 rounded-3 bg-dark border border-success text-success">
                      <FileText size={26} />
                    </div>
                    <div>
                      <div className="small text-muted uppercase fw-semibold">Total Reports</div>
                      <div className="fs-3 fw-bold mono-font text-white">{stats.totalReports}</div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="lunar-card p-3 d-flex align-items-center gap-3">
                    <div className="p-3 rounded-3 bg-dark border border-warning text-warning">
                      <Activity size={26} />
                    </div>
                    <div>
                      <div className="small text-muted uppercase fw-semibold">AI Predictions</div>
                      <div className="fs-3 fw-bold mono-font text-white">{stats.totalPredictions}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Breakdown */}
              <div className="lunar-card p-4">
                <h5 className="fw-bold brand-heading text-white mb-3">System Recommendation Distribution</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="p-3 bg-dark rounded-3 border border-success text-center">
                      <div className="text-muted small uppercase">CLEARED LANDINGS</div>
                      <div className="fs-2 fw-bold text-success mono-font">{stats.recommendationDistribution.cleared}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-dark rounded-3 border border-warning text-center">
                      <div className="text-muted small uppercase">CAUTION LANDINGS</div>
                      <div className="fs-2 fw-bold text-warning mono-font">{stats.recommendationDistribution.caution}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3 bg-dark rounded-3 border border-danger text-center">
                      <div className="text-muted small uppercase">ABORTED LANDINGS</div>
                      <div className="fs-2 fw-bold text-danger mono-font">{stats.recommendationDistribution.aborted}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Users Management */}
          {activeTab === 'users' && (
            <div className="lunar-card p-4">
              <h5 className="fw-bold brand-heading text-white mb-3">Registered Operators Directory</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-muted small border-secondary">
                      <th>NAME</th>
                      <th>EMAIL</th>
                      <th>ORGANIZATION</th>
                      <th>SYSTEM ROLE</th>
                      <th>JOIN DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-secondary border-opacity-25">
                        <td className="fw-semibold text-white">{u.name}</td>
                        <td className="mono-font small">{u.email}</td>
                        <td className="small text-muted">{u.organization}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Reports Audit */}
          {activeTab === 'reports' && (
            <div className="lunar-card p-4">
              <h5 className="fw-bold brand-heading text-white mb-3">Global Landing Reports Audit Log</h5>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-muted small border-secondary">
                      <th>REPORT TITLE</th>
                      <th>OPERATOR</th>
                      <th>SAFETY SCORE</th>
                      <th>STATUS</th>
                      <th className="text-end">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r._id} className="border-secondary border-opacity-25">
                        <td>
                          <div className="fw-semibold text-white">{r.reportTitle}</div>
                          <div className="small text-muted mono-font">ID: #{r._id.slice(-8).toUpperCase()}</div>
                        </td>
                        <td className="small">{r.userId?.name || 'Unknown'}</td>
                        <td className="mono-font fw-bold text-white">{r.terrainSafetyScore}%</td>
                        <td>
                          <span
                            className={
                              r.recommendationStatus === 'CLEARED_FOR_LANDING'
                                ? 'badge-cleared'
                                : r.recommendationStatus === 'PROCEED_WITH_CAUTION'
                                ? 'badge-caution'
                                : 'badge-aborted'
                            }
                          >
                            {r.recommendationStatus?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleDeleteReport(r._id)}
                            className="btn btn-outline-danger btn-sm py-1"
                          >
                            <Trash2 size={14} className="me-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
