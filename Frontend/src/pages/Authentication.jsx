import React, { useState, useContext } from 'react';
import { Lock } from 'lucide-react';
import './authentication.css';
import Button from '@mui/material/Button';
import { AuthContext } from '../context/authContext';
import Snackbar from '@mui/material/Snackbar';

function Authentication() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState(0); // 0 = Login, 1 = Register
  const [open, setOpen] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleAuth = async (e) => {
    e.preventDefault(); // prevent page reload
    setError('');

    try {
      if (formState === 0) {
        // Login
        await handleLogin(username, password);
      } else {
        // Register
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);

        // Reset form for login
        setFormState(0);
        setPassword('');
        setUsername('');
        setName('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon">
            <Lock size={28} />
          </div>
          <h2 className="auth-title">{formState === 0 ? 'Welcome Back' : 'Create Account'}</h2>

          <div className="sign">
            <Button onClick={() => setFormState(0)} variant={formState === 0 ? "contained" : "outlined"}>
              Sign In
            </Button>
            <Button onClick={() => setFormState(1)} variant={formState === 1 ? "contained" : "outlined"}>
              Sign Up
            </Button>
          </div>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleAuth}>
          {formState === 1 && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              required
            />
          </div>

          <p style={{ color: "red", textAlign: "center", fontWeight: 600 }}>{error}</p>

          <button type="submit" className="submit-button">
            {formState === 0 ? "Login" : "Register"}
          </button>
        </form>

        {/* Footer Links */}
        <p className="signup-text">
          {formState === 0 ? "Don't have an account?" : "Already have an account?"}{' '}
          <button className="link-button-primary" onClick={() => setFormState(formState === 0 ? 1 : 0)}>
            {formState === 0 ? "Sign up now" : "Sign in"}
          </button>
        </p>
      </div>

      <p className="footer-text">
        By signing in, you agree to our{' '}
        <button className="footer-link">Terms of Service</button> and{' '}
        <button className="footer-link">Privacy Policy</button>
      </p>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </div>
  );
}

export default Authentication;
