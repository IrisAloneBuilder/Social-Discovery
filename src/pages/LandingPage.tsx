import { useEffect, useRef, useState } from "react";
import Hero3D from "../components/Hero3D/Hero3D";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ArrowDown from "../components/Icons/ArrowDown";
import VerticalProgress from "../components/VerticalProgress";
import QuickSignUpPreview from "../components/QuickSignUpPreview.tsx";

import "../Style/LandingPageStyle.scss";

export function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Triggers once
        }
      },
      { threshold: 0.2 }, // Triggers when 20% of element is visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

// Define coordinates/rotations for the background cards
const CARD_POSITIONS = [
  {
    tag: "Redeem code",
    user: "Free profile cosmetics",
    top: "15%",
    left: "0%",
    rotX: 0,
    rotY: 70,
    scale: 0.9,
  },
  {
    tag: "90% Customizable ",
    user: "Make your profile yours",
    top: "15%",
    right: "0%",
    rotX: 0,
    rotY: -70,
    scale: 0.9,
  },
  {
    tag: "Deep Discovery",
    user: "Find shared passions",
    top: "18.9%",
    left: "11.9%",
    rotX: 0,
    rotY: 70,
    scale: 0.77,
  },
  {
    tag: "Live Messaging",
    user: "Connect instantly",
    top: "18.9%",
    right: "11.9%",
    rotX: 0,
    rotY: -70,
    scale: 0.77,
  },
  {
    tag: "Rich Presence",
    user: "Show your active status",
    top: "36%",
    left: "0%",
    rotX: 0,
    rotY: 70,
    scale: 0.9,
  },
  {
    tag: "Custom CSS",
    user: "Style every element",
    top: "36%",
    right: "0%",
    rotX: 0,
    rotY: -70,
    scale: 0.9,
  },
  {
    tag: "Interest Tags",
    user: "Match on shared hobbies",
    top: "36.5%",
    left: "11.9%",
    rotX: 0,
    rotY: 70,
    scale: 0.77,
  },
  {
    tag: "Bio Badges",
    user: "Showcase your achievements",
    top: "36.5%",
    right: "11.9%",
    rotX: 0,
    rotY: -70,
    scale: 0.77,
  },
  {
    tag: "Match Score",
    user: "Find like-minded peers",
    top: "57%",
    right: "0%",
    rotX: 0,
    rotY: -70,
    scale: 0.9,
  },
  {
    tag: "Profile Perks",
    user: "Unlock unique items",
    top: "54%",
    right: "12%",
    rotX: 0,
    rotY: -70,
    scale: 0.77,
  },
  {
    tag: "Custom Privacy",
    user: "You decide who sees what",
    top: "54.25%",
    left: "12%",
    rotX: 0,
    rotY: 70,
    scale: 0.77,
  },
  {
    tag: "Smart Matching",
    user: "Algorithm-free discovery",
    top: "57%",
    left: "0%",
    rotX: 0,
    rotY: 70,
    scale: 0.9,
  },
  {
    tag: "Live Messaging",
    user: "Connect instantly",
    top: "21.8%",
    right: "20.4%",
    rotX: 0,
    rotY: -70,
    scale: 0.65,
  },
  {
    tag: "Bio Badges",
    user: "Showcase your achievements",
    top: "36.9%",
    right: "20.4%",
    rotX: 0,
    rotY: -70,
    scale: 0.65,
  },
  {
    tag: "Profile Perks",
    user: "Unlock unique items",
    top: "52%",
    right: "20.4%",
    rotX: 0,
    rotY: -70,
    scale: 0.65,
  },
  {
    tag: "Deep Discovery",
    user: "Find shared passions",
    top: "21.5%",
    left: "20.4%",
    rotX: 0,
    rotY: 70,
    scale: 0.65,
  },
  {
    tag: "Interest Tags",
    user: "Match on shared hobbies",
    top: "36.5%",
    left: "20.4%",
    rotX: 0,
    rotY: 70,
    scale: 0.65,
  },
  {
    tag: "Custom Privacy",
    user: "You decide who sees what",
    top: "52%",
    left: "20.4%",
    rotX: 0,
    rotY: 70,
    scale: 0.65,
  },
];

const STEPS_DATA = [
  { id: 1, title: "Quick Sign up" },
  { id: 2, title: "Chose your interests tags" },
  { id: 3, title: "Add Your Socials & Contact Info" },
  { id: 4, title: "Reach Out & Connect" },
];

export default function LandingPage() {
  const { ref, isInView } = useInView();

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Selects all elements with the 'parallax-text' class
          const parallaxElements =
            document.querySelectorAll<HTMLElement>(".parallax-text");
          const windowHeight = window.innerHeight;

          parallaxElements.forEach((el) => {
            const rect = el.getBoundingClientRect();

            // Run effect only when element is visible on screen
            if (rect.top < windowHeight && rect.bottom > 0) {
              const yOffset = (rect.top - windowHeight) * 0.18;
              el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <header>
        <Navbar />
      </header>

      <main>
        <div className={`hero-section `}>
          <h1>
            FIND YOUR NICHE.{" "}
            <span className="Multi-color-text">CONNECT INSTANTLY.</span>
          </h1>
          <p>
            Search by shared interests and instantly match with people who share
            your exact hobbies, projects, and passions.
          </p>
          <div className="buttons-container">
            <button className="dashboard-btn">Launch Dashboard ✦</button>
            <button className="guide-btn" onClick={scrollToHowItWorks}>
              <div className="slider">
                <span className="scroll-text">
                  Scroll <ArrowDown />
                </span>
                <br />
                <span className="btn-text">How It Works</span>
              </div>
            </button>
          </div>
        </div>

        <div className="canva">
          <Hero3D />
        </div>

        <section className="section-1 ">
          <div
            ref={ref}
            className={`text-container parallax-text ${isInView ? "is-visible" : ""}`}
          >
            <h1>YOU ARE NOT ALONE.</h1>
            <h2>Find thousands with shared passion and mutual understanding</h2>
          </div>
          <div className="bg-shadow"></div>

          {/* Background Cards Layer */}
          <div className="bg-cards-layer">
            {CARD_POSITIONS.map((card, idx) => (
              <div
                key={idx}
                className="bg-card"
                style={
                  {
                    top: card.top,
                    left: card.left,
                    right: card.right,
                    transform: `rotateX(${card.rotX}deg) rotateY(${card.rotY}deg) scale(${card.scale})`,
                    /* Generates a fixed staggered delay so cards start at different points */
                    /* Staggered delay up to 12s */
                    "--card-delay": `-${((idx * 5.1) % 35).toFixed(2)}s`,
                    /* Rare loop duration between 45s and 90s */
                    "--card-duration": `${(10 + ((idx * 1.3) % 10)).toFixed(1)}s`,
                  } as React.CSSProperties
                }
              >
                {" "}
                <div className="card-content">
                  <h2 className="card-tag" data-text={card.tag}>
                    {card.tag}
                  </h2>
                  <p className="card-sub">{card.user}</p>
                </div>
              </div>
            ))}{" "}
          </div>

          {/* Background Walls */}
          <div className="bg-walls-layer"></div>
          <div className="wall-top"></div>
          <div className="wall-bottom"></div>
          <div className="wall-left"></div>
          <div className="wall-right"></div>

          <h3 className="tip-1">
            ↑
            <br /> hover
          </h3>
        </section>

        <section className="section-2" id="how-it-works">
          <div className="section-header parallax-text">
            <h2>MATCH WITHOUT THE NOISE</h2>
            <p>
              Skip crowded servers. Find exact collaborators, specialized devs,
              or people who share your vibe instantly.
            </p>
          </div>
          <VerticalProgress steps={STEPS_DATA} />
          {/* Embed the animated preview */}
          <QuickSignUpPreview className="step-1" />
        </section>
      </main>
      <div className="footer">
        <Footer />
      </div>
    </>
  );
}
