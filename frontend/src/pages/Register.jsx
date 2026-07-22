import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Mail, Lock, Building, AlertCircle } from 'lucide-react';
import Starfield3D from '../components/3d/Starfield3D';
import Moon3D from '../components/3d/Moon3D';
import TiltCard from '../components/TiltCard';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: 'Lunar Research Center',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.organization,
        formData.role
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
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
          <div className="col-lg-5 d-none d-lg-block text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <Moon3D height="400px" />
            </motion.div>
          </div>

          {/* Right Column: Glassmorphism Register Card */}
          <div className="col-md-9 col-lg-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TiltCard className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    className="d-inline-flex p-3 rounded-circle bg-dark border border-info mb-3 text-info"
                  >
                    <ShieldCheck size={32} />
                  </motion.div>
                  <h3 className="fw-bold brand-heading gradient-text">PILOT REGISTRATION</h3>
                  <p className="text-muted small">Register user credentials for lunar hazard assessment access</p>
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
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          name="name"
                          className="form-control form-control-lunar"
                          placeholder="Dr. Neil Armstrong"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          name="email"
                          className="form-control form-control-lunar"
                          placeholder="armstrong@nasa.gov"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Organization / Research Institute</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-secondary">
                        <Building size={18} />
                      </span>
                      <input
                        type="text"
                        name="organization"
                        className="form-control form-control-lunar"
                        placeholder="NASA / ESA / ISRO / MIT"
                        value={formData.organization}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted">Password (Min 6 chars)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          <Lock size={18} />
                        </span>
                        <input
                          type="password"
                          name="password"
                          className="form-control form-control-lunar"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          minLength={6}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6 mb-4">
                      <label className="form-label small text-muted">System Role</label>
                      <select
                        name="role"
                        className="form-select form-control-lunar"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="user">Mission Operator (User)</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn btn-lunar-primary w-100 py-2.5 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? 'Creating Credentials...' : 'Register & Access System'}
                  </motion.button>
                </form>

                <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <span className="text-muted small">Already registered? </span>
                  <Link to="/login" className="text-info text-decoration-none small fw-semibold">
                    Sign In to Account
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

export default Register;
