import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Rocket, History, User, LogOut, LayoutDashboard, UploadCloud, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`navbar navbar-expand-lg lunar-navbar sticky-top navbar-dark py-3 ${
        scrolled ? 'shadow-lg border-cyan-glow' : ''
      }`}
      style={{
        backdropFilter: scrolled ? 'blur(24px)' : 'blur(16px)',
        backgroundColor: scrolled ? 'rgba(7, 10, 18, 0.9)' : 'rgba(15, 23, 42, 0.75)',
      }}
    >
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 brand-heading text-white fw-bold" to="/">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="p-2 rounded-3 bg-dark border border-cyan text-info d-flex align-items-center"
          >
            <Rocket size={22} className="text-cyan" />
          </motion.div>
          <span>LUNAR<span className="text-info gradient-text">LANDING</span>.AI</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarLunarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarLunarContent">
          {user ? (
            <>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
                {[
                  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
                  { path: '/upload', label: 'Terrain Analysis', icon: UploadCloud },
                  { path: '/history', label: 'Scan Logs', icon: History },
                  ...(user.role === 'admin' ? [{ path: '/admin', label: 'Admin Control', icon: ShieldAlert, warning: true }] : []),
                ].map((item) => {
                  const IconComp = item.icon;
                  const active = isActive(item.path);
                  return (
                    <li className="nav-item position-relative" key={item.path}>
                      <Link
                        className={`nav-link d-flex align-items-center gap-1.5 px-3 ${
                          item.warning ? 'text-warning' : active ? 'active text-info' : ''
                        }`}
                        to={item.path}
                      >
                        <IconComp size={18} />
                        <span>{item.label}</span>
                        {active && (
                          <motion.div
                            layoutId="activeNavIndicator"
                            className="position-absolute bottom-0 start-0 end-0 bg-info rounded-pill"
                            style={{ height: '3px', boxShadow: '0 0 12px #00f2fe' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="d-flex align-items-center gap-3">
                <Link to="/profile" className="text-decoration-none text-light d-flex align-items-center gap-2 px-3 py-1.5 rounded-3 bg-dark border border-secondary spotlight-card">
                  <User size={16} className="text-info" />
                  <span className="small fw-semibold">{user.name}</span>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                >
                  <LogOut size={16} /> Logout
                </motion.button>
              </div>
            </>
          ) : (
            <div className="ms-auto d-flex gap-2">
              <Link to="/login" className="btn btn-lunar-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-lunar-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
