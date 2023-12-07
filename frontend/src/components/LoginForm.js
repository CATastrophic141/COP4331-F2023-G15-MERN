// LoginForm.js
import React from "react";

function LoginForm({
  handleLogin,
  username,
  setUsername,
  usernameError,
  password,
  setPassword,
  loginError,
  toggleLoginForm,
}) {
    return (
        <div className="login-register-form">
        <div className="label-input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={usernameError ? "invalid-input" : "valid-input"}
          />
        </div>
        <div className="label-input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={loginError ? "invalid-input" : "valid-input"}
          />
        </div>
        {loginError && <p className="error-text">{loginError}</p>}
        <div className="login-button-container">
          <button className="login-button" onClick={handleLogin}>
            Log In
          </button>
          <button className="back-button" onClick={toggleLoginForm}>
            Go Back
          </button>
        </div>
      </div>
  );
}

export default LoginForm;