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

function checkPassword(password, username, email) {
    // Minimum length check
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
  
    // Complexity check
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
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