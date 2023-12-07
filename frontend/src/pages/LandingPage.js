import React, { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import "../components/LandingPage.css";

import LoginForm from "../components/LoginForm.js";
import RegisterForm from "../components/RegisterForm.js";
import ValidationStep from "../components/ValidationStep.js";
import ForgotPasswordStep from "../components/ForgotPasswordStep.js";
import NewPasswordStep from "../components/NewPasswordStep.js";

const bp = require("../components/Path.js");
const storage = require("../tokenStorage.js");

function checkPassword(password, username, email) {
  // Minimum length check
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  // Complexity check
  const complexityRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  if (!complexityRegex.test(password)) {
    return "Include a uppercase letter, a lowercase letter, a number, and a special character.";
  }

  // No user-specific information check
  if (password.includes(username) || password.includes(email)) {
    return "Password cannot contain your username or email.";
  }

  // If all checks pass, return null to indicate a valid password
  return null;
}

const LandingPage = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showValidationStep, setShowValidationStep] = useState(false);
  const [showForgotPasswordStep, setForgotPasswordStep] = useState(false);
  const [showNewPasswordStep, setShowNewPasswordStep] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [validationCode, setValidationCode] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userID, setUserID] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [alreadyExistsError, setAlreadyExistsError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [resetError, setResetError] = useState("");
  const [newPasswordSuccess, setNewPasswordSuccess] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);

  const [registerDetails, setRegisterDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    login: "",
    password: "",
  });

  const [registerCode, setRegisterCode] = useState(""); //Code truth source: registry
  const [newPassCode, setNewPassCode] = useState(""); //Code truth source: New password setting

  const clearErrors = () => {
    setUsernameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setFirstNameError("");
    setLastNameError("");
    setLoginError("");
    setAlreadyExistsError("");
    setValidationError("");
    setNewPasswordError("");
    setResetError("");
  };

  ////// MODE TOGGLERS //////////////////////////////////

  const toggleLoginForm = () => {
    setShowLoginForm(!showLoginForm);
    // Reset error messages when toggling forms
    clearErrors();
  };

  const toggleRegisterForm = () => {
    setShowRegisterForm(!showRegisterForm);
    // Reset error messages when toggling forms
    clearErrors();
  };

  const toggleValidationStep = () => {
    setShowValidationStep(!showValidationStep);
    // Reset error messages when toggling forms
    clearErrors();
  };

  const toggleNewPasswordStep = () => {
    setShowNewPasswordStep(!showNewPasswordStep);
    // Reset error messages when toggling forms
    clearErrors();
  };

  const toggleForgotPassword = () => {
    setForgotPasswordStep(!showForgotPasswordStep);
    // Reset error messages when toggling forms
    clearErrors();
  };

  const returnFromPasswordReset = () => {
    setShowNewPasswordStep(false);
    setForgotPasswordStep(false);
  }

  const returnFromVerify = () => {
    setShowRegisterForm(false);
    setShowValidationStep(false);
  }

  ///////////////////////////////////////////////////////

  ////// VALIDITY CHECKERS //////////////////////////////

  const isUsernameValid = (username) => {
    // Define a regular expression to match usernames without special characters
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  };

  const isNameValid = (name) => {
    const nameRegex = /^[A-Za-z-' ]+$/;
    return nameRegex.test(name);
  };

  const isEmailValid = (email) => {
    // Define a regular expression to match email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  };

  const isPhoneValid = (phone) => {
    // Define a regular expression to match a valid phone number format
    const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/; // Formats: "(123)-456-7890," "123.456.7890," "123 456 7890," and "123-456-7890."
    return phoneRegex.test(phone);
  };

  ///////////////////////////////////////////////////////

  const handleLogin = async (event) => {
    event.preventDefault();

    //console.log("Attemping to log in with username %s and password %s\n", username, password);

    const login = username;
    var loginDetails = { login: login, password: password };

    //console.log("Username and Password types:" ,typeof username, typeof password);
    
    var loginJSON = JSON.stringify(loginDetails);

    //console.log("LoginDetails: ", loginDetails);
    //console.log("LoginJSON: ", loginJSON);

    // Try to do the Login API call
    try {
      const response = await fetch(bp.buildPath("api/account/login"), {
        method: "POST",
        body: loginJSON,
        headers: { "Content-Type": "application/json" },
      });

      //console.log("Got response from Login API");

      var responseDetails = await response.text();
      try {
        responseDetails = JSON.parse(responseDetails);
        //console.log("Parsed response details:", responseDetails);
      } catch (e) {
        console.log("Bad response from API");
      }
      //console.log(responseDetails);
      //console.log(responseDetails.Status);

      const {accessToken} = responseDetails.Token;
      //console.log("Response Details's token:", accessToken);
      //const decodedResponseDetails = null;
      const decodedResponseDetails = jwtDecode(accessToken, {complete:true}); // Decoded access token (comes as hashed string, need to un-hash to get imprtnt info)
      //console.log("Decoded response details:", decodedResponseDetails);

      if (decodedResponseDetails.firstName == "")
      {
        setLoginError("Username/Password combination incorrect");
      } 
      else if (decodedResponseDetails.firstName != "") {
        console.log("Login successful");
        var user = {
          firstName: decodedResponseDetails.firstName,
          lastName: decodedResponseDetails.lastName,
          id: decodedResponseDetails.id,
        };
        localStorage.setItem("user_data", JSON.stringify(user));  // Set the user ID, first, and last name in Local Storage
        storage.storeToken(responseDetails.Token);  // Store the token
        //console.log("Stored token %s\n", responseDetails.Token);
        setPasswordError("");
        setLoginError("");
        goToNextPage();
      }
    } catch (e) {
      console.log(e.toString());
      setLoginError("Login does not exist or error from API received");
      return;
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    /* CAN REMOVE FOR PRODUCTION */
    clearErrors();
    ////

    let err = false;

    if (!isNameValid(firstName)) {
      setFirstNameError("Invalid first name");
      err = true;
    }

    if (!isNameValid(lastName)) {
      setLastNameError("Invalid last name");
      err = true;
    }

    if (!isEmailValid(email)) {
      setEmailError("Invalid email format.");
      err = true;
    }

    if (!isPhoneValid(phone)) {
      setPhoneError("Invalid phone format.");
      err = true;
    }

    if (!isUsernameValid(username)) {
      setUsernameError("Invalid username format.");
      err = true;
    }

    const passwordValidation = checkPassword(password, username, email);
    if (passwordValidation != null) {
      setPasswordError(passwordValidation);
      err = true;
    }

    if (err === true) {
      return;
    }

    setRegisterDetails({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      login: username,
      password: password,
    });
    //setReg is an async call. This can cause issues but the info is used later in another call.
    var rapidJSON = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      login: username,
      password: password,
    }
    //console.log("JOSN test:", rapidJSON);
    //console.log("Used JSON:", registerDetails);
    //console.log("JSON equiv test:", JSON.stringify(rapidJSON) === JSON.stringify(registerDetails));
    var registerJSON = JSON.stringify(rapidJSON);

    //console.log("Sending request to API:");
    //console.log("Sent:", registerJSON);

    try {
      const response = await fetch(bp.buildPath("api/account/checkExists"), {
        method: "POST",
        body: registerJSON,
        headers: { "Content-Type": "application/json" },
      });

      var responseDetails = JSON.parse(await response.text());
      //console.log("Response:", responseDetails);

      if (
        responseDetails.hasOwnProperty("Status") &&
        responseDetails.Status != 200
      ) {
        //Handle errors
        console.log("Error from register API");
        //console.log(responseDetails);
        setAlreadyExistsError("Username or email already in use");
      } else {
        console.log("Register request good");
        clearErrors();
        var emailToVerify = {
          email: email,
        };
        var verifJSON = JSON.stringify(emailToVerify);
        // SEND EMAIL API/////////////////////////////////////////////////////////////////
        try {
          const response = await fetch(bp.buildPath("api/account/verify"), {
            method: "POST",
            body: verifJSON,
            headers: { "Content-Type": "application/json" },
          });

          var responseDetails = JSON.parse(await response.text());
          //console.log("Response: ", responseDetails);

          if (
            responseDetails.hasOwnProperty("verfCode") &&
            responseDetails.verfCode != ""
          ) {
            //console.log("Verification code sent");
            //console.log("Retrieved code: ", responseDetails.verfCode)
            setRegisterCode('');
            setRegisterCode(responseDetails.verfCode);
            toggleValidationStep(); // Move to code entry
          } else {
            console.log("Failed to send verification code");
          }
        } catch (e) {
          console.log(e.toString());
          setAlreadyExistsError("Error from API");
          return;
        }
        ////////////////////////////////////////////////////////////////////////////////
      }
    } catch (e) {
      console.log(e.toString());
      setAlreadyExistsError("Error from API");
      return;
    }

    console.log("Registration handler complete.");
  };

  const handleValidation = async (event) => {
    event.preventDefault();
    //console.log(typeof validationCode);
    //console.log("User entry: ",validationCode)
    //console.log(typeof registerCode);
    //console.log("Needed entry: ", registerCode);
    //console.log("Codes Equal? ",validationCode === registerCode);

    if (validationCode == registerCode) {
      var JSONtest = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        login: username,
        password: password,
      }
      //console.log("Test JSON:", registerDetails);
      //console.log("Used JSON:", JSONtest);
      //console.log("JSONs Equal?", JSON.stringify(JSONtest) === JSON.stringify(registerDetails));
      var registerJSON = JSON.stringify(registerDetails);

      //console.log("Sending request to API:");
      //console.log(registerJSON);

      try {
        const response = await fetch(bp.buildPath("api/account/Register"), {
          method: "POST",
          body: registerJSON,
          headers: { "Content-Type": "application/json" },
        });

        var responseDetails = JSON.parse(await response.text());
        //console.log(responseDetails);

        if (
          responseDetails.hasOwnProperty("Status") &&
          responseDetails.Status != 200
        ) {
          //Handle errors
          console.log("Error from register API");
          //console.log(responseDetails);
        } else {
          console.log("Register request good");
          setValidationSuccess(true);
          clearErrors();
          setValidationError("Account created. Please return to start and login");
          //goToNextPage();
        }
      } catch (e) {
        console.log(e.toString())
        setValidationError("Error from API.");
        return;
      }
    } else {
      setValidationSuccess(false);
      setValidationError("Incorrect or invalid code");
    }
  };

  const handleForgotEmail = async (event) => {
    event.preventDefault();

    if (!isEmailValid(email)) {
      setForgotError("Invalid email format.");
      return;
    }

    var userEmail = {email:email};
    var emailJSON = JSON.stringify(userEmail);
    
    // Call API to check for email existence and if so, send email. Return ID, code, and username. //////
    
    try {
      //Example call: api/account/passwordReset/653eca5191007dd74fcd10c7
      const response = await fetch(bp.buildPath("api/account/passwordReset"), {
        method: "POST",
        body: emailJSON,
        headers: { "Content-Type": "application/json" },
      });

      var responseDetails = JSON.parse(await response.text());
      //console.log(responseDetails);

      if (
        responseDetails.hasOwnProperty("Status") &&
        responseDetails.Status != 200
      ) {
        //Handle errors
        //console.log("Error from register API");
        //console.log(responseDetails);
        setForgotError("Failed to send email. Please try again later");
      } else {
        console.log("Register request good");
        setNewPassCode(responseDetails.verfCode);
        setUsername(responseDetails.Login);
        setUserID(responseDetails.UserId);
        toggleNewPasswordStep(); //If successful
      }
    } catch (e) {
      console.log(e.toString());
      setForgotError("Failed to send email. Please try again later");
      return;
    }
    ///////////////////////////////////////////////////////////////

  };

  const handleSetNewPassword = async (event) => {

    //console.log("Attempting to set new password. User info: ", userID, username, newPassword, resetCode);

    const passwordValidation = checkPassword(newPassword, username, email);
    if (passwordValidation != null) {
      setNewPasswordSuccess(false);
      setNewPasswordError(passwordValidation);
      //console.log("Bad password");
      return;
    }

    clearErrors("");

    //console.log("Codes: ", newPassCode, resetCode);
    //console.log("Codes Equal?", newPassCode == resetCode);

    if (newPassCode == resetCode) {

      //console.log("api/account/passwordReset/"+userID)
      // SEND NEW PASSWORD TO API ///////////////////////////////////////

      var userDetails = {
        password:newPassword
      }
      var newPasswordJSON = JSON.stringify(userDetails);

      try {
        //Example call: api/account/passwordReset/653eca5191007dd74fcd10c7
        const response = await fetch(bp.buildPath("api/account/passwordReset/"+userID), {
          method: "PUT",
          body: newPasswordJSON,
          headers: { "Content-Type": "application/json" },
        });
  
        var responseDetails = JSON.parse(await response.text());
        //console.log("Response: ", responseDetails);
  
        if (
          responseDetails.hasOwnProperty("Status") &&
          responseDetails.Status != 200
        ) {
          //Handle errors
          console.log("Error from register API");
          //console.log(responseDetails);
          setNewPasswordSuccess(true);
          setNewPasswordError("Password reset failed. Please try again later");
        } else {
          console.log("Register request good");
          
          clearErrors();

          setPassword("");
          setNewPassword("");
          setResetCode("");
          setEmail("");
          setUsername("");
          setNewPasswordSuccess(true);
          setNewPasswordError("Success. Please return to start");
          //From here user should press "Return to Start"
        }
      } catch (e) {
        console.log(e.toString());
        setNewPasswordError("Password reset failed. Please try again later");
        return;
      }

      /////////////////////////////////////////////////////////////////////////////
    }
    else {
      setResetError("Invalid code");
      return;
    }
  };

  const goToNextPage = () => {
    window.location.href = "/pages";
  };

  useEffect(() => {
    console.log("Register code: ", registerCode); //Truth source
  }, [registerCode]);

  useEffect(() => {
    console.log("New password code: ", newPassCode); //Truth source
  }, [newPassCode]);

  return (
    <div className="landing-page">
      <div className="background-image"></div>
      <div className="content">
        <div className="title-box">
          <h1>PlaceFolio</h1>
          <h2>The map-based digital photo album</h2>
        </div>

        <div className="login-register-box">
          {showLoginForm ? (
            <LoginForm
              handleLogin={handleLogin}
              username={username}
              setUsername={setUsername}
              usernameError={usernameError}
              password={password}
              setPassword={setPassword}
              loginError={loginError}
              toggleLoginForm={toggleLoginForm}
            />
          ) : showRegisterForm ? (
            showValidationStep ? (
              <ValidationStep
                handleValidation={handleValidation}
                validationCode={validationCode}
                setValidationCode={setValidationCode}
                registerCode={registerCode}
                validationError={validationError}
                toggleValidationStep={toggleValidationStep}
                returnFromVerify={returnFromVerify}
                validationSuccess={validationSuccess}
              />
            ) : (
              <RegisterForm
                handleRegister={handleRegister}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                firstNameError={firstNameError}
                lastNameError={lastNameError}
                emailError={emailError}
                phoneError={phoneError}
                usernameError={usernameError}
                passwordError={passwordError}
                alreadyExistsError={alreadyExistsError}
                toggleRegisterForm={toggleRegisterForm}
              />
            )
          ) : showForgotPasswordStep ? (
            showNewPasswordStep ? (
              <NewPasswordStep
                handleSetNewPassword={handleSetNewPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                newPasswordError={newPasswordError}
                newPasswordSuccess={newPasswordSuccess}
                toggleNewPasswordStep={toggleNewPasswordStep}
                setResetCode={setResetCode}
                resetCode={resetCode}
                resetError={resetError}
                returnFromPasswordReset={returnFromPasswordReset}
              />
            ) : (
              <ForgotPasswordStep
                handleForgotEmail={handleForgotEmail}
                email={email}
                setEmail={setEmail}
                forgotError={forgotError}
                toggleForgotPassword={toggleForgotPassword}
              />
            )
          ) : (
            <div className="button-container">
              <button className="login-button" onClick={toggleLoginForm}>
                Log In
              </button>
              <button className="register-button" onClick={toggleRegisterForm}>
                Register
              </button>
              <button className="forgot-button" onClick={toggleForgotPassword}>
                Forgot Password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
