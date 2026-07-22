import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MapPin, Printer, ArrowLeft, Cpu, Activity, Info, AlertTriangle, RotateCw } from 'lucide-react';

const ReportView = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/landing/report/${id}`);
        if (res.data.success) {
          setReport(res.data.data);
        }
      } catch (err) {
        console.error('Error loading report:', err);
        setError('Landing report not found or authorization failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return <div className="container py-5 text-center text-muted">Retrieving lunar landing report telemetry...</div>;
  }

  if (error || !report) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mb-3">{error || 'Report unavailable.'}</div>
        <Link to="/history" className="btn btn-lunar-outline">Back to Scan Logs</Link>
      </div>
    );
  }

  const {
    reportTitle,
    terrainSafetyScore,
    hazardCount,
    recommendedLandingCoordinates,
    environmentalAssessment,
    recommendationStatus,
    imageId,
    detectionResultId,
    userId,
    createdAt,
  } = report;

  const imageUrl = imageId?.filename ? `/uploads/${imageId.filename}` : null;
  const pathColor = terrainSafetyScore >= 75 ? '#00e676' : terrainSafetyScore >= 50 ? '#ffaa00' : '#ff3d71';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-4"
    >
      {/* Header Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/history" className="btn btn-lunar-outline btn-sm d-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to Scan Logs
        </Link>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.print()}
          className="btn btn-lunar-primary btn-sm d-flex align-items-center gap-1"
        >
          <Printer size={16} /> Export / Print Report
        </motion.button>
      </div>

      {/* Main Report Container */}
      <div className="lunar-card p-4 p-md-5">
        <div className="border-bottom border-secondary border-opacity-25 pb-3 mb-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <span className="badge bg-dark border border-info text-info mono-font mb-2">
                OFFICIAL LUNAR ASSESSMENT REPORT
              </span>
              <h2 className="fw-bold brand-heading gradient-text mb-1">{reportTitle}</h2>
              <div className="small text-muted mono-font">
                OPERATOR: {userId?.name} ({userId?.organization}) | GENERATED: {new Date(createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <span
                className={
                  recommendationStatus === 'CLEARED_FOR_LANDING'
                    ? 'badge-cleared fs-6'
                    : recommendationStatus === 'PROCEED_WITH_CAUTION'
                    ? 'badge-caution fs-6'
                    : 'badge-aborted fs-6'
                }
              >
                {recommendationStatus?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* 3D Flip Card Container for Summary Metrics */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted mono-font">CLICK CARD TO TOGGLE 3D FLIP DIAGNOSTICS VIEW</span>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="btn btn-outline-info btn-sm py-0.5 px-2 mono-font d-flex align-items-center gap-1"
            >
              <RotateCw size={12} /> Flip Card
            </button>
          </div>

          <div
            className="perspective-1000 cursor-pointer"
            style={{ height: '220px' }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
              {/* Front Side: Radial Score Gauge & Highlights */}
              <div className="flip-card-front p-4 bg-dark rounded-3 border border-info d-flex align-items-center justify-content-around">
                <div style={{ width: 120, height: 120 }}>
                  <CircularProgressbar
                    value={terrainSafetyScore}
                    text={`${terrainSafetyScore}%`}
                    styles={buildStyles({
                      textColor: '#ffffff',
                      pathColor: pathColor,
                      trailColor: 'rgba(255, 255, 255, 0.1)',
                      textSize: '22px',
                    })}
                  />
                </div>
                <div>
                  <div className="small text-muted text-uppercase fw-semibold mb-1">RECOMMENDATION STATUS</div>
                  <h3 className="fw-bold brand-heading text-white">{recommendationStatus?.replace(/_/g, ' ')}</h3>
                  <div className="small text-muted">
                    Total Identified Hazards: <span className="text-danger fw-bold">{hazardCount?.total || 0}</span>
                  </div>
                </div>
              </div>

              {/* Back Side: Hazard Matrix & Target Zone */}
              <div className="flip-card-back p-4 bg-dark rounded-3 border border-cyan d-flex align-items-center justify-content-around">
                <div>
                  <div className="small text-muted text-uppercase fw-semibold mb-2">HAZARD MATRIX BREAKDOWN</div>
                  <div className="small mono-font text-light">
                    • Craters: <span className="text-danger fw-bold">{hazardCount?.craters || 0}</span><br />
                    • Boulders: <span className="text-warning fw-bold">{hazardCount?.boulders || 0}</span><br />
                    • Slopes: <span className="text-info fw-bold">{hazardCount?.slopes || 0}</span>
                  </div>
                </div>
                <div>
                  <div className="small text-muted text-uppercase fw-semibold mb-2">TARGET COORDINATES</div>
                  <div className="small mono-font text-success fw-bold">
                    X: {recommendedLandingCoordinates?.centerX || 250} px | Y: {recommendedLandingCoordinates?.centerY || 250} px<br />
                    Radius: {recommendedLandingCoordinates?.radius || 100} px
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental & Image Display */}
        <div className="row g-4">
          <div className="col-lg-6">
            <h5 className="fw-bold brand-heading text-white mb-3">Surface Image Scan</h5>
            <div className="rounded-3 border border-secondary overflow-hidden bg-dark text-center p-2">
              {imageUrl ? (
                <img src={imageUrl} alt="Lunar Surface Scan" className="img-fluid rounded-3" style={{ maxHeight: '400px', objectFit: 'contain' }} />
              ) : (
                <div className="py-5 text-muted">Scan image file unavailable</div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <h5 className="fw-bold brand-heading text-white mb-3">Environmental Diagnostics</h5>
            <div className="p-4 bg-dark rounded-3 border border-secondary h-100">
              <div className="mb-3">
                <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                  <Activity size={16} className="text-info" /> Surface Roughness Index (Laplacian)
                </div>
                <div className="fs-5 fw-bold mono-font text-white">
                  {environmentalAssessment?.roughnessIndex ?? 2.45} / 10.0
                </div>
              </div>

              <div className="mb-3">
                <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                  <Cpu size={16} className="text-info" /> Average Slope Gradient
                </div>
                <div className="fs-5 fw-bold mono-font text-white">
                  {environmentalAssessment?.slopeGradientAvg ?? 4.2}° Inclination
                </div>
              </div>

              <div className="mb-3">
                <div className="small text-muted mb-1 d-flex align-items-center gap-1">
                  <Info size={16} className="text-info" /> Solar Incidence & Lighting
                </div>
                <div className="fs-6 mono-font text-white">
                  {environmentalAssessment?.lightingCondition ?? 'Optimal Solar Angle (32°)'}
                </div>
              </div>

              <div className="pt-3 border-top border-secondary border-opacity-25">
                <div className="small text-muted fw-semibold uppercase mb-1">AI Execution Diagnostics</div>
                <div className="mono-font small text-info">
                  Model: YOLOv8-Lunar + TF Safety Engine | Time: {detectionResultId?.executionTimeMs || 240}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportView;
