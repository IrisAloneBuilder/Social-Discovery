import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/LoginStyle.scss";

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialLogin = (provider: string) => {
    // External redirect to auth server uses window.location or standard navigation
    window.location.href = `/api/auth/${provider}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", formData);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-header">
          {/* Replaced <a> with <Link> for seamless home navigation */}
          <Link to="/" className="logo-title">
            Social Discovery
          </Link>
          <h1>Welcome Back</h1>
          <p>Log in to jump straight into your friends and conversations.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="identifier">Email or Username</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="alex_22 or you@example.com"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Sign In ✦
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>
        {/* Quick Social Logins */}
        <div className="social-buttons">
          <button
            type="button"
            className="social-btn google"
            onClick={() => handleSocialLogin("google")}
          >
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            className="social-btn discord"
            onClick={() => handleSocialLogin("discord")}
          >
            <span>Continue with Discord</span>
          </button>
        </div>
        <div className="signup-prompt">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
