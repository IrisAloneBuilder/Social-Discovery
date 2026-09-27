import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Style/DashboardStyle.scss";

// Dummy profile data to test the search grid
const MOCK_PROFILES = [
  {
    id: 1,
    username: "cyber_echo",
    bio: "Building indie web tools & experimenting with synth vocals. Always open to collaborate.",
    tags: ["Music Production", "React", "Calisthenics"],
    contacts: { discord: "echo#0001", github: "https://github.com" },
  },
  {
    id: 2,
    username: "pixel_dev",
    bio: "Looking for someone to play Roblox or test out UI layouts.",
    tags: ["Roblox", "UI Design", "Gaming"],
    contacts: { discord: "pixel_dev_real" },
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
    <div className="dashboard-container">
      {/* Top Header Navigation */}
      <header className="dash-header">
        <Link to="/" className="dash-logo">
          Social Discovery
        </Link>
        <div className="user-profile-menu">
          <span>@alex_22</span>
        </div>
      </header>

      {/* Filter Section */}
      <section className="search-section">
        <h1>Find Your Match</h1>
        <p>
          Filter by tags to find people who match your exact vibe or project
          needs.
        </p>

        <div className="tags-cloud">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              className={`tag-pill ${selectedTags.includes(tag) ? "active" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>

      {/* Matches Grid */}
      <section className="cards-grid">
        {MOCK_PROFILES.map((profile) => (
          <div key={profile.id} className="profile-card">
            <div className="card-top">
              <h3>@{profile.username}</h3>
            </div>
            <p className="bio">{profile.bio}</p>

            <div className="card-tags">
              {profile.tags.map((t) => (
                <span key={t} className="badge">
                  #{t}
                </span>
              ))}
            </div>

            <div className="card-actions">
              {profile.contacts.discord && (
                <button className="contact-btn discord">
                  Discord: {profile.contacts.discord}
                </button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
