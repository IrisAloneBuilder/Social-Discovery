import React, { useEffect, useRef, useState } from "react";
import "../Style/VerticalProgressStyle.scss";

interface Step {
  id: number;
  title?: string;
}

interface VerticalProgressProps {
  steps: Step[];
}

const VerticalProgress: React.FC<VerticalProgressProps> = ({ steps }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progressHeight, setProgressHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Progress starts when container enters middle viewport and finishes near the bottom
      const startPoint = windowHeight * 0.5;
      const totalDistance = rect.height - windowHeight * 0.5;
      const currentScroll = startPoint - rect.top;

      let pct = (currentScroll / totalDistance) * 100;
      pct = Math.min(Math.max(pct, 0), 100);

      setProgressHeight(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="progress-container">
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ height: `${progressHeight}%` }}
        />
      </div>

      {steps.map((step, index) => {
        const stepThreshold = (index / (steps.length - 1 || 1)) * 100;
        const isReached = progressHeight >= stepThreshold;

        return (
          <div
            key={step.id}
            className={`progress-step ${isReached ? "active" : ""}`}
          >
            <div className="progress-circle">{step.id}</div>
            {step.title && (
              <div className="progress-content">
                <p>{step.title}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VerticalProgress;
