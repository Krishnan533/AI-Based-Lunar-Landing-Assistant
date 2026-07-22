import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Eye, Search, Filter } from 'lucide-react';
import TiltCard from '../components/TiltCard';

const History = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/landing/history');
        if (res.data.success) {
          setReports(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredReports = reports.filter((item) => {
    const matchesFilter =
      filter === 'ALL' || item.recommendationStatus === filter;
    const matchesSearch =
      item.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container py-4"
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <span className="badge bg-dark border border-info text-info mono-font mb-1">
            TELEMETRY ARCHIVE
          </span>
          <h2 className="fw-bold brand-heading gradient-text mb-0">LUNAR SCAN LOGS</h2>
        </div>
        <Link to="/upload" className="btn btn-lunar-primary btn-sm">
          + Launch New Surface Scan
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <TiltCard className="p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control form-control-lunar form-control-sm"
                placeholder="Search scan title or report ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end gap-2">
            {['ALL', 'CLEARED_FOR_LANDING', 'PROCEED_WITH_CAUTION', 'LANDING_ABORTED'].map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                className={`btn btn-sm ${
                  filter === f ? 'btn-info' : 'btn-outline-secondary text-light'
                }`}
              >
                {f === 'ALL' ? 'All' : f.split('_')[0]}
              </motion.button>
            ))}
          </div>
        </div>
      </TiltCard>

      {/* Scan Log Table */}
      <div className="lunar-card p-4">
        {loading ? (
          <div className="text-center py-5 text-muted">Retrieving telemetry archive...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-5 text-muted">No scan logs matched your filter.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-muted small border-secondary">
                  <th>SCAN TITLE / ID</th>
                  <th>TIMESTAMP</th>
                  <th>SAFETY SCORE</th>
                  <th>HAZARDS</th>
                  <th>RECOMMENDATION STATUS</th>
                  <th className="text-end">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report, idx) => (
                  <motion.tr
                    key={report._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className="border-secondary border-opacity-25"
                  >
                    <td>
                      <div className="fw-semibold text-white">{report.reportTitle}</div>
                      <div className="small text-muted mono-font">
                        ID: #{report._id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="small text-muted">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="fw-bold mono-font text-white">{report.terrainSafetyScore}%</span>
                    </td>
                    <td className="mono-font small">
                      <span className="text-danger">{report.hazardCount?.craters || 0}</span> Craters,{' '}
                      <span className="text-warning">{report.hazardCount?.boulders || 0}</span> Rocks
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default History;
