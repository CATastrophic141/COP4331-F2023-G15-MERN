//ValidationStep.js
import React from "react";

function ValidationStep({
  handleValidation,
  validationCode,
  setValidationCode, // Define setValidationCode
  validationError,
  toggleValidationStep,
  returnFromVerify,
  validationSuccess
}) {
  return (
    <div className="login-register-form">
      <div className="prompt">
        Please enter the validation code sent to the Email you entered.
      </div>
      <div className="input-error-group">
        <div className="label-input-group">
          <label htmlFor="validationCode">Validation Code</label>
          <input
            type="text"
            id="validationCode"
            placeholder="Validation Code"
            value={validationCode}
            onChange={(e) => setValidationCode(e.target.value)}
          />
        </div>
        {validationError && (
              <p className={!validationSuccess ? "error-text" : "success-text"}>{validationError}</p>
            )}
      </div>
      <div className="validation-button-container">
        <div className="vertical-buttons">
          <button
            className="confirm-button"
            onClick={handleValidation}
          >
            Confirm
          </button>
          <button
            className="back-button"
            onClick={returnFromVerify}
          >
            Return to Start
          </button>
        </div>
      </div>
    </div>
  );
}

export default ValidationStep;
