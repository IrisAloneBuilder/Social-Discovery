import "../Style/QuickSignUpPreviewStyle.scss";

interface QuickSignUpPreviewProps {
  className?: string;
}

export default function QuickSignUpPreview({
  className = "",
}: QuickSignUpPreviewProps) {
  return (
    <div className={`quick-signup-card ${className}`.trim()}>
      <div className="card-top">
        <span className="badge">STEP 01 • INSTANT AUTH</span>
        <h4>Create Account</h4>
      </div>

      <div className="preview-field field-username">
        <span className="field-label">Username</span>
        <div className="input-mock">
          <span className="typed-text text-user"></span>
          <span className="cursor"></span>
        </div>
      </div>

      <div className="preview-field field-email">
        <span className="field-label">Email</span>
        <div className="input-mock">
          <span className="typed-text text-email"></span>
          <span className="cursor"></span>
        </div>
      </div>

      <button className="preview-btn" type="button">
        <span className="btn-text-idle">Create Account ✦</span>
        <span className="btn-text-active">Ready ✓</span>
      </button>

      {/* Cyber Grid Accents */}
      <div className="corner-accent top-left" />
      <div className="corner-accent bottom-right" />
    </div>
  );
}
