import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, DEFAULT_USERS } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSuccess = (u) => {
    if (u.role === 'ADMIN') navigate('/admin');
    else if (u.role === 'REPLIER') navigate('/replier');
    else navigate('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(username, password);
    if (res.success) handleSuccess(res.user);
    else setError(res.message);
  };

  const handlePersona = (u) => {
    login(u.username, u.password);
    handleSuccess(u);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">🎫</div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your support dashboard</p>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Username</label>
            <input type="text" placeholder="Enter your username" value={username} onChange={e=>setUsername(e.target.value)} required />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-submit-login">Sign In</button>
        </form>

        <div className="login-divider">
          <hr /><span>or sign in as a demo persona</span><hr />
        </div>

        <div className="persona-grid">
          {DEFAULT_USERS.map(u => (
            <button key={u.username} type="button" className="persona-card" onClick={() => handlePersona(u)}>
              <div className={`persona-avatar ${u.role.toLowerCase()}`}>
                {u.name.split(' ').map(w=>w[0]).join('').toUpperCase()}
              </div>
              <div className="persona-details">
                <div className="persona-name">{u.name}</div>
                <div className="persona-creds">{u.username} / {u.password}</div>
              </div>
              <span className={`persona-role ${u.role.toLowerCase()}`}>{u.role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
