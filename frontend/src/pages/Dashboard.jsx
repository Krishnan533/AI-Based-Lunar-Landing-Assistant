import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Rocket, ShieldCheck, AlertTriangle, ShieldX, UploadCloud, Eye, RefreshCw, Layers } from 'lucide-react';
import TiltCard from '../components/TiltCard';

// Animated Count Up Component
const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; // 1.2s
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/landing/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="container py-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <TiltCard className="p-4 mb-4 position-relative overflow-hidden">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-dark border border-info text-info mb-2 mono-font">
                SYSTEM TELEMETRY ONLINE
              </span>
              <h2 className="fw-bold brand-heading gradient-text mb-2">
                WELCOME BACK, {user?.name?.toUpperCase()}
              </h2>
              <p className="text-muted mb-3">
                {user?.organization} — Autonomous Lunar Terrain Hazard Detection & Safety Scoring Engine.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/upload" className="btn btn-lunar-primary btn-sm d-flex align-items-center gap-2">
                  <UploadCloud size={18} /> Launch New Surface Scan
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchStats}
                  className="btn btn-lunar-outline btn-sm d-flex align-items-center gap-2"
                >
                  <RefreshCw size={16} /> Refresh Telemetry
                </motion.button>
              </div>
            </div>
            <div className="col-lg-4 text-end d-none d-lg-block">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="p-3 d-inline-block text-cyan"
              >
                <Rocket size={120} className="opacity-35 text-info" />
              </motion.div>
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Metrics 3D Tilt Counter Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Scans', val: stats ? stats.totalScans : 0, icon: Layers, color: 'text-info', border: 'border-info' },
          { label: 'Cleared Landings', val: stats ? stats.clearedLandings : 0, icon: ShieldCheck, color: 'text-success', border: 'border-success' },
          { label: 'Caution Landings', val: stats ? stats.cautionLandings : 0, icon: AlertTriangle, color: 'text-warning', border: 'border-warning' },
          { label: 'Aborted Scans', val: stats ? stats.abortedLandings : 0, icon: ShieldX, color: 'text-danger', border: 'border-danger' },
        ].map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div className="col-md-3" key={idx}>
              <motion.div variants={itemVariants}>
                <TiltCard className="p-3 d-flex align-items-center gap-3">
                  <div className={`p-3 rounded-3 bg-dark border ${card.border} ${card.color}`}>
                    <IconComp size={26} />
                  </div>
                  <div>
                    <div className="small text-muted text-uppercase fw-semibold">{card.label}</div>
                    <div className={`fs-3 fw-bold mono-font ${card.color}`}>
                      <AnimatedCounter value={card.val} />
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Recent Landing Scans */}
      <motion.div variants={itemVariants}>
        <div className="lunar-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold brand-heading text-white mb-0">Recent Terrain Analyses</h5>
            <Link to="/history" className="text-info text-decoration-none small">
              View Full Log →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted">Loading telemetry data...</div>
          ) : !stats || stats.recentReports.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted mb-3">No lunar surface scans conducted yet.</div>
              <Link to="/upload" className="btn btn-lunar-primary btn-sm">
                <UploadCloud size={16} className="me-1" /> Perform First Scan
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr className="text-muted small border-secondary">
                    <th>REPORT ID / TITLE</th>
                    <th>SCAN DATE</th>
                    <th>SAFETY SCORE</th>
                    <th>HAZARDS</th>
                    <th>RECOMMENDATION</th>
                    <th className="text-end">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentReports.map((report) => (
                    <tr key={report._id} className="border-secondary border-opacity-25">
                      <td>
                        <div className="fw-semibold text-white">{report.reportTitle}</div>
                        <div className="small text-muted mono-font">
                          ID: #{report._id.slice(-8).toUpperCase()}
                        </div>
                      </td>
                      <td className="small text-muted">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="fw-bold mono-font text-white">{report.terrainSafetyScore}%</div>
                          <div className="progress w-50 bg-dark" style={{ height: '6px' }}>
                            <div
                              className={`progress-bar ${
                                report.terrainSafetyScore >= 75
                                  ? 'bg-success'
                                  : report.terrainSafetyScore >= 50
                                  ? 'bg-warning'
                                  : 'bg-danger'
                              }`}
                              style={{ width: `${report.terrainSafetyScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="mono-font small">
                        <span className="text-danger">{report.hazardCount?.total || 0}</span> detected
                      </td>
                      <td>
                        <span
                          className={
                            report.recommendationStatus === 'CLEARED_FOR_LANDING'
                              ? 'badge-cleared'
                              : report.recommendationStatus === 'PROCEED_WITH_CAUTION'
                              ? 'badge-caution'
                              : 'badge-aborted'
                          }
                        >
                          {report.recommendationStatus?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="text-end">
                        <Link to={`/report/${report._id}`} className="btn btn-lunar-outline btn-sm py-1">
                          <Eye size={14} className="me-1" /> View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
