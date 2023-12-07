// NewPasswordStep.js
import React from "react";

function NewPasswordStep({
  handleSetNewPassword,
  newPassword,
  setNewPassword, // Define setNewPassword
  newPasswordError,
  newPasswordSuccess,
  toggleNewPasswordStep,
  setResetCode,
  resetCode,
  resetError,
  returnFromPasswordReset
}) {
  return (
    <div className="login-register-form">
      <div className="input-error-group">
        <div className="label-input-group">
          <label htmlFor="reset-code">Code</label>
            <input
                type="text"
                id="reset-code"
                placeholder="Code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className={resetError ? "invalid-input" : "valid-input"}
              />
            </div>
            {resetError && <p className="error-text">{resetError}</p>}
          </div>
      <div className="input-error-group">
        <div className="label-input-group">
          <label htmlFor="new-password">New Password</label>
            <input
                type="password"
                id="new-password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={newPasswordError ? "invalid-input" : "valid-input"}
              />
            </div>
            {newPasswordError && (
              <p className={!newPasswordSuccess ? "error-text" : "success-text"}>{newPasswordError}</p>
            )}
          </div>
          <div className="validation-button-container">
            <div className="vertical-buttons">
              <button
                className="confirm-button"
                onClick={handleSetNewPassword}
              >
                Confirm
              </button>
              <button
                className="back-button"
                onClick={returnFromPasswordReset}
              >
                Return to Start
              </button>
            </div>
          </div>
        </div>
    );
}
    
export default NewPasswordStep;
