
import '../Style/FooterStyle.scss';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand">
          <span className="logo-text">
            SOCIAL DISCOVERY<span className="accent">.</span>
          </span>
          <p className="tagline">Find your niche. Connect safely.</p>
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>All Systems Operational</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="footer-links">
          <div className="link-group">
            <h4>Platform</h4>
            <a href="#discover">Discover</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
          </div>

          <div className="link-group">
            <h4>Community</h4>
            <a href="https://discord.gg" target="_blank" rel="noreferrer">
              Discord Server
            </a>
            <a href="#rules">Guidelines</a>
          </div>

          <div className="link-group">
            <h4>Legal</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Social Discovery. All rights reserved.</p>
        <div className="social-links">
          <a href="https://discord.gg" target="_blank" rel="noreferrer" aria-label="Discord">
            ✦ Discord
          </a>
        </div>
      </div>
    </footer>
  );
}
