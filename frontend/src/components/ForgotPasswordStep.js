// ForgotPasswordStep.js
import React from "react";

function ForgotPasswordStep({
  handleForgotEmail,
  email,
  setEmail, // Define setEmail
  forgotError,
  toggleForgotPassword,
}) {
  return (
    <div className="login-register-form">
      <div className="input-error-group">
        <div className="label-input-group">
          <label htmlFor="forgot-pw-error">Email</label>
          <input
            type="text"
            id="forgot-pw-email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={
              forgotError ? "invalid-input" : "valid-input"
            }
          />
        </div>
        {forgotError && <p className="error-text">{forgotError}</p>}
      </div>
      <div className="validation-button-container">
        <div className="vertical-buttons">
          <button
            className="confirm-button"
            onClick={handleForgotEmail}
          >
            Send Reset Request
          </button>
          <button
            className="back-button"
            onClick={toggleForgotPassword}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordStep;
