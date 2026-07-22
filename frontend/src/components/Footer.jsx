import React from 'react';
import { Rocket, ShieldCheck, Cpu } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto py-4 border-top border-secondary border-opacity-25 bg-dark text-muted">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 brand-heading text-white small">
              <Rocket size={16} className="text-info" /> AI-BASED LUNAR LANDING ASSISTANT
            </div>
            <p className="small text-muted mb-0 mt-1">
              Autonomous Lunar Surface Hazard Detection & Safe Landing Zone Scoring System
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end mono-font extra-small text-secondary">
            <span className="badge bg-secondary me-2">YOLOv8 Engine</span>
            <span className="badge bg-secondary me-2">TensorFlow Safety Net</span>
            <span className="badge bg-dark border border-info text-info">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
