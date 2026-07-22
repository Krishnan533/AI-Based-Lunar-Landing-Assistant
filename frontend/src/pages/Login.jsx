import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Rocket, Lock, Mail, AlertCircle } from 'lucide-react';
import Starfield3D from '../components/3d/Starfield3D';
import Moon3D from '../components/3d/Moon3D';
import TiltCard from '../components/TiltCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="position-relative min-vh-100 d-flex align-items-center py-5 overflow-hidden">
      {/* 3D Particle Starfield Canvas */}
      <Starfield3D />

      <div className="container position-relative" style={{ zIndex: 10 }}>
        <div className="row align-items-center justify-content-center">
          {/* Left Column: Interactive 3D Moon */}
          <div className="col-lg-6 d-none d-lg-block text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <Moon3D height="450px" />
              <div className="text-muted small mono-font mt-2">
                [INTERACTIVE 3D LUNAR MODEL - CURSOR TILT ACTIVE]
              </div>
            </motion.div>
          </div>

          {/* Right Column: Glassmorphism Login Card */}
          <div className="col-md-8 col-lg-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TiltCard className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.8 }}
                    className="d-inline-flex p-3 rounded-circle bg-dark border border-info mb-3 text-info"
                  >
                    <Rocket size={32} />
                  </motion.div>
                  <h3 className="fw-bold brand-heading gradient-text">LUNAR ACCESS</h3>
                  <p className="text-muted small">Sign in to initialize autonomous terrain telemetry</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="alert alert-danger d-flex align-items-center gap-2 small"
                    role="alert"
                  >
                    <AlertCircle size={18} />
                    <div>{error}</div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small text-muted">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-secondary">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        className="form-control form-control-lunar"
                        placeholder="astronaut@nasa.gov"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small text-muted">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-secondary">
                        <Lock size={18} />
                      </span>
                      <input
                        type="password"
                        className="form-control form-control-lunar"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn btn-lunar-primary w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Telemetry'}
                  </motion.button>
                </form>

                <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <span className="text-muted small">Need an account? </span>
                  <Link to="/register" className="text-info text-decoration-none small fw-semibold">
                    Register Pilot Credentials
                  </Link>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
