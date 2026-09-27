import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/SignUpStyle.scss";

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialSignUp = (provider: string) => {
    // Redirect to your backend auth endpoint (e.g., /api/auth/google)
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="card-header">
          <Link to="/" className="logo-title">
            Social Discovery
          </Link>
          <h1>Create Account</h1>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="signup-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="e.g. alex_22"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
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

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Account ✦
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
            onClick={() => handleSocialSignUp("google")}
          >
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            className="social-btn discord"
            onClick={() => handleSocialSignUp("discord")}
          >
            <span>Continue with Discord</span>
          </button>
        </div>

        <div className="login-prompt">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
