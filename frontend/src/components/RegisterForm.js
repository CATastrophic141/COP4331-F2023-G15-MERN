import React from "react";

function RegisterForm({
  handleRegister,
  firstName,
  setFirstName, // Define setFirstName
  lastName,
  setLastName, // Define setLastName
  email,
  setEmail, // Define setEmail
  phone,
  setPhone, // Define setPhone
  username,
  setUsername, // Define setUsername
  password,
  setPassword, // Define setPassword
  firstNameError,
  lastNameError,
  emailError,
  phoneError,
  usernameError,
  passwordError,
  alreadyExistsError,
  toggleRegisterForm,
}) {
  return (
    <div className="login-register-form">
      <div className="input-row-group">
        <div className="input-error-group">
          <div className="label-input-group">
            <label htmlFor="first-name">First Name</label>
            <input
              type="text"
              id="first-name"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={firstNameError ? "invalid-input" : "valid-input"}
            />
          </div>
          {firstNameError && <p className="error-text">{firstNameError}</p>}
        </div>
        <div className="input-error-group">
          <div className="label-input-group">
            <label htmlFor="last-name">Last Name</label>
            <input
              type="text"
              id="last-name"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={lastNameError ? "invalid-input" : "valid-input"}
            />
          </div>
          {lastNameError && <p className="error-text">{lastNameError}</p>}
        </div>
      </div>
      <div className="input-row-group">
        <div className="input-error-group">
          <div className="label-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              placeholder="Name@Host.Domain"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={emailError ? "invalid-input" : "valid-input"}
            />
          </div>
          {emailError && <p className="error-text">{emailError}</p>}
        </div>
        <div className="input-error-group">
          <div className="label-input-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              placeholder="(XXX)-XXX-XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={phoneError ? "invalid-input" : "valid-input"}
            />
          </div>
          {phoneError && <p className="error-text">{phoneError}</p>}
        </div>
      </div>
      <div className="input-row-group">
        <div className="input-error-group">
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
          {usernameError && <p className="error-text">{usernameError}</p>}
        </div>
        <div className="input-error-group">
          <div className="label-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordError ? "invalid-input" : "valid-input"}
            />
          </div>
          {passwordError && <p className="error-text">{passwordError}</p>}
        </div>
      </div>
      {alreadyExistsError && (
        <p className="error-text">{alreadyExistsError}</p>
      )}
      <div className="register-button-container">
        <button className="register-button" onClick={handleRegister}>
          Register
        </button>
        <button className="back-button" onClick={toggleRegisterForm}>
          Go Back
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
