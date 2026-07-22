import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Building, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.put('/users/profile', {
        name,
        organization,
        password: password || undefined,
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully.');
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="lunar-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 rounded-circle bg-dark border border-info mb-3 text-info">
                <User size={32} />
              </div>
              <h3 className="fw-bold brand-heading text-white">OPERATOR PROFILE</h3>
              <p className="text-muted small">Manage account credentials and organization affiliation</p>
            </div>

            {successMsg && (
              <div className="alert alert-success d-flex align-items-center gap-2 small" role="alert">
                <CheckCircle size={18} />
                <div>{successMsg}</div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small" role="alert">
                <AlertCircle size={18} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small text-muted">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control form-control-lunar bg-dark opacity-75"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lunar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Organization / Research Group</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <Building size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lunar"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small text-muted">New Password (Leave blank to keep current)</label>
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
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-lunar-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                <Save size={18} />
                {loading ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
