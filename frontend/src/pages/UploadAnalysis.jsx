import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { UploadCloud, Cpu, FileText, Image as ImageIcon, ArrowRight, Sparkles } from 'lucide-react';
import TiltCard from '../components/TiltCard';

const UploadAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Create synthetic sample image directly in browser if requested
  const handleLoadSampleImage = () => {
    setError('');
    setAnalysisResult(null);

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Regolith base
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, 800, 600);

    // Craters
    const craters = [
      { x: 150, y: 450, r: 35 },
      { x: 570, y: 380, r: 45 },
      { x: 200, y: 175, r: 60 },
      { x: 650, y: 150, r: 40 },
    ];

    craters.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
      ctx.fillStyle = '#334155';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    // Boulders
    const boulders = [
      { x: 380, y: 300, r: 12 },
      { x: 450, y: 125, r: 15 },
      { x: 360, y: 280, r: 10 },
    ];

    boulders.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
    });

    canvas.toBlob((blob) => {
      const file = new File([blob], 'sample_lunar_surface.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
    }, 'image/jpeg');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select, drop, or click "Load Sample Lunar Image".');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await api.post('/landing/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setAnalysisResult(res.data.data);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to complete surface hazard analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Draw bounding boxes on Canvas overlay once analysis completes
  useEffect(() => {
    if (analysisResult && canvasRef.current && previewUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = previewUrl;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        const { hazards, safeZones } = analysisResult.detectionResult;

        // 1. Draw Safe Landing Zone (Green)
        if (safeZones && safeZones.length > 0) {
          safeZones.forEach((zone) => {
            const { x1, y1, x2, y2 } = zone.bbox;
            ctx.fillStyle = 'rgba(0, 230, 118, 0.25)';
            ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

            ctx.strokeStyle = '#00e676';
            ctx.lineWidth = 4;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            // Center Target Crosshair
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
            ctx.moveTo(cx - 28, cy);
            ctx.lineTo(cx + 28, cy);
            ctx.moveTo(cx, cy - 28);
            ctx.lineTo(cx, cy + 28);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#00e676';
            ctx.font = 'bold 18px Orbitron, sans-serif';
            ctx.fillText(`TARGET LANDING ZONE (${zone.score}%)`, x1 + 12, y1 + 32);
          });
        }

        // 2. Draw Hazard Boxes (Red/Orange)
        if (hazards && hazards.length > 0) {
          hazards.forEach((hazard) => {
            const { x1, y1, x2, y2 } = hazard.bbox;
            ctx.strokeStyle = hazard.label === 'crater' ? '#ff3d71' : '#ffaa00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            ctx.fillStyle = hazard.label === 'crater' ? '#ff3d71' : '#ffaa00';
            ctx.font = '14px JetBrains Mono, monospace';
            ctx.fillText(
              `${hazard.label.toUpperCase()} ${Math.round(hazard.confidence * 100)}%`,
              x1,
              Math.max(18, y1 - 8)
            );
          });
        }
      };
    }
  }, [analysisResult, previewUrl]);

  const score = analysisResult ? analysisResult.detectionResult.overallSafetyScore : 0;
  const pathColor = score >= 75 ? '#00e676' : score >= 50 ? '#ffaa00' : '#ff3d71';

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <span className="badge bg-dark border border-info text-info mb-2 mono-font">AI INFERENCE PIPELINE</span>
        <h2 className="fw-bold brand-heading gradient-text">LUNAR TERRAIN HAZARD SCANNERS</h2>
        <p className="text-muted">
          Upload lunar surface orbital imagery or load sample image for real-time hazard detection & safety scoring
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Upload Controls */}
        <div className="col-lg-5">
          <TiltCard className="p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold brand-heading text-white mb-0">1. Select Orbital Image</h5>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleLoadSampleImage}
                className="btn btn-outline-info btn-sm d-flex align-items-center gap-1 mono-font"
              >
                <Sparkles size={14} /> Load Sample Image
              </motion.button>
            </div>

            {error && (
              <div className="alert alert-danger small mb-3">{error}</div>
            )}

            {/* Drop Zone */}
            <div
              className="border-2 border-dashed rounded-3 p-4 text-center cursor-pointer mb-3 position-relative"
              style={{
                borderColor: selectedFile ? 'var(--primary-cyan)' : 'rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
              />
              <UploadCloud size={48} className="text-info mb-2" />
              <div className="fw-semibold text-white">
                {selectedFile ? selectedFile.name : 'Drag & drop lunar image here or click "Load Sample Image"'}
              </div>
              <div className="small text-muted mt-1">Supports JPEG, PNG, WEBP (Max 15MB)</div>
            </div>

            {selectedFile && (
              <div className="p-3 bg-dark rounded-3 mb-3 border border-secondary border-opacity-25">
                <div className="d-flex justify-content-between text-muted small mono-font">
                  <span>FILE: {selectedFile.name}</span>
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUploadAndAnalyze}
              className="btn btn-lunar-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2 mb-3"
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <Cpu className="spin me-1" size={20} />
                  Running AI Telemetry & Hazard Analysis...
                </>
              ) : (
                <>
                  <Cpu size={20} />
                  Execute AI Terrain Hazard Analysis
                </>
              )}
            </motion.button>

            {/* Parameter Details Info */}
            <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-25 text-muted small">
              <div className="fw-bold text-white mb-1 d-flex align-items-center gap-1">
                <Cpu size={14} className="text-info" /> AI Pipeline Specs
              </div>
              <ul className="mb-0 ps-3">
                <li>YOLOv8 Crater & Boulder Detection</li>
                <li>OpenCV Hough Contour Roughness Matrix</li>
                <li>TensorFlow Surface Safety Score Engine</li>
              </ul>
            </div>
          </TiltCard>
        </div>

        {/* Right Column: Interactive Canvas Bounding Box Visualizer with Scanning Beam */}
        <div className="col-lg-7">
          <TiltCard className="p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold brand-heading text-white mb-0">2. Real-Time Vision Preview</h5>
              {analysisResult && (
                <span className="badge bg-dark border border-success text-success mono-font">
                  SCAN COMPLETE
                </span>
              )}
            </div>

            {!previewUrl ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5 border border-secondary border-opacity-25 rounded-3 bg-dark min-vh-40 text-muted">
                <ImageIcon size={64} className="opacity-25 mb-3" />
                <div className="mb-2">Upload an image or click "Load Sample Image" above.</div>
                <button onClick={handleLoadSampleImage} className="btn btn-lunar-outline btn-sm">
                  <Sparkles size={14} className="me-1" /> Load Sample Lunar Surface
                </button>
              </div>
            ) : (
              <div>
                <div className="canvas-wrapper mb-3 position-relative">
                  {/* Scanning Beam Animation during AI processing */}
                  {loading && <div className="scanning-beam" />}
                  <canvas ref={canvasRef} />
                </div>

                {analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="p-3 rounded-3 bg-dark border border-info"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 60, height: 60 }}>
                          <CircularProgressbar
                            value={score}
                            text={`${score}%`}
                            styles={buildStyles({
                              textColor: '#ffffff',
                              pathColor: pathColor,
                              trailColor: 'rgba(255, 255, 255, 0.1)',
                              textSize: '24px',
                            })}
                          />
                        </div>
                        <div>
                          <div className="small text-muted uppercase">OVERALL LANDING SAFETY SCORE</div>
                          <div className="fs-3 fw-bold mono-font text-info">
                            {analysisResult.detectionResult.overallSafetyScore}%
                          </div>
                        </div>
                      </div>

                      <div>
                        <span
                          className={
                            analysisResult.landingReport.recommendationStatus === 'CLEARED_FOR_LANDING'
                              ? 'badge-cleared fs-6'
                              : analysisResult.landingReport.recommendationStatus === 'PROCEED_WITH_CAUTION'
                              ? 'badge-caution fs-6'
                              : 'badge-aborted fs-6'
                          }
                        >
                          {analysisResult.landingReport.recommendationStatus?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/report/${analysisResult.landingReport._id}`)}
                      className="btn btn-lunar-primary w-100 mt-2 d-flex align-items-center justify-content-center gap-2"
                    >
                      <FileText size={18} /> View Comprehensive Landing Report <ArrowRight size={18} />
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}
          </TiltCard>
        </div>
      </div>
    </div>
  );
};

export default UploadAnalysis;
