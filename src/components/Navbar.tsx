import { Link } from "react-router-dom";

interface NavbarProps {
  user?: { name: string };
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="logo">
        <a href="#Home">Social Discovery</a>
      </div>

      <div className="nav-links">
        <a href="#guide">Features</a>
        <a href="#community">Community</a>
        <a href="#about">About</a>
      </div>

      <div className="right-group">
        {user ? (
          <button className="launch-btn">Launch Dashboard</button>
        ) : (
          <Link to="/signup" className="sign-up-btn">
            Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}
