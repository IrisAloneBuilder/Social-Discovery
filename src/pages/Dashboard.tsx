import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/DashboardStyle.scss";

// Upgraded mock data with avatars and banners
const MOCK_PROFILES = [
  {
    id: 1,
    username: "cyber_echo",
    status: "Looking to collaborate 🚀",
    bio: "Building indie web tools & experimenting with synth vocals. Always open to collaborate.",
    tags: ["Music Production", "React", "Calisthenics"],
    contacts: { discord: "echo#0001" },
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=echo&backgroundColor=b6e3f4",
    banner: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
  },
  {
    id: 2,
    username: "pixel_dev",
    status: "Playing Roblox 🎮",
    bio: "Looking for someone to play Roblox or test out UI layouts.",
    tags: ["Roblox", "UI Design", "Gaming"],
    contacts: { discord: "pixel_dev_real" },
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=pixel&backgroundColor=c0aede",
    banner: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  },
  {
    id: 3,
    username: "linux_knight",
    status: "Deep in the terminal 🐧",
    bio: "Arch Linux user. Customizing Hyprland workflows and writing full-stack apps.",
    tags: ["React", "UI Design"],
    contacts: { discord: "knight_00" },
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=knight&backgroundColor=ffdfbf",
    banner: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
];

const POPULAR_TAGS = [
  "React",
  "Roblox",
  "Calisthenics",
  "Music Production",
  "UI Design",
  "Gaming",
];

export default function Dashboard() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="app-layout">
      {/* App Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">SD</div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active" title="Discovery">
            🌍
          </button>
          <button className="nav-item" title="Messages">
            💬
          </button>
          <button className="nav-item setting" title="Settings">
            ⚙️
          </button>
        </nav>
        <div className="sidebar-bottom">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=ffd5dc"
            alt="You"
            className="user-avatar-small"
          />
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        {/*} <div className="search-bar">
          <input type="text" placeholder="Search users by name or keyword..." />
        </div>

        {/* Filter Bar (Now sticky and clean) */}
        <section className="filter-dock">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              className={`filter-pill ${selectedTags.includes(tag) ? "active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </section>

        {/* Upgraded Profile Cards */}
        <section className="user-grid">
          {MOCK_PROFILES.map((profile) => (
            <div key={profile.id} className="user-card">
              <div
                className="card-banner"
                style={{ background: profile.banner }}
              ></div>

              <div className="card-body">
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="card-avatar"
                />

                <div className="card-info">
                  <h3>@{profile.username}</h3>
                  <span className="status-badge">{profile.status}</span>
                </div>

                <p className="card-bio">{profile.bio}</p>

                <div className="card-tags">
                  {profile.tags.map((t) => (
                    <span key={t} className="tag">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-footer">
                <button className="connect-btn discord">
                  <span className="icon">🎮</span> Connect
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
