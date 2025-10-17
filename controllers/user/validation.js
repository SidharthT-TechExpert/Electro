// Validation functions
function validateName() {
  const nameInput = nameId.value;
  const name = nameId.value.trim();

  const pattern = /^(?=.{3,30})[A-Za-z]+(?: [A-Za-z]+)*$/
  if (name.length < 3 || name.length > 30) {
  return "Name must be between 3 and 30 characters.";
}

  if (nameInput !== name) {
    nameErrorId.style.display = "inline-block";
    nameErrorId.textContent = "❌ Name cannot start or end with a space.";
    e.focus();
    return false;
  }

  if (!pattern.test(name)) {
    nameErrorId.style.display = "inline-block";
    nameErrorId.textContent =
      "Name must be 3 – 30 characters long and contain only letters and spaces.";
    return false;
  } else {
    nameErrorId.style.display = "none";
    nameErrorId.textContent = "";
    return true;
  }
}

// Email validation
function validate_Email() {
  const emailInput = emailId.value;

  // Trim spaces from both ends
  const email = emailId.value.trim();

  // Check for leading/trailing spaces
  if (emailInput !== email) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.textContent = "❌ Email cannot start or end with a space.";
    return false;
  }

  // Regex for valid email format
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!pattern.test(email)) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.textContent =
      "❌ Please enter a valid email (e.g., user@example.com).";
    return false;
  }

  // Clear error if valid
  emailErrorId.style.display = "none";
  emailErrorId.textContent = "";
  return true;
}

function validatePhone() {
  let phone = phoneId.value.trim();
  const pattern = /^[6-9][0-9]{9}$/;

  if (!pattern.test(phone)) {
    phoneErrorId.style.display = "inline-block";
    phoneErrorId.textContent = "Enter a valid 10-digit Indian mobile number !";
    return false;
  } else {
    phoneErrorId.style.display = "none";
    phoneErrorId.textContent = "";
    return true;
  }
}

function validatePassword() {
  const passwordInput = passwordId.value;
  const password = passwordInput.trim();

  const cPassword = cPasswordId.value.trim();

  const lower = /[a-z]/,
    upper = /[A-Z]/,
    digit = /\d/,
    special = /[@$!%*?&]/,
    allowed = /^[A-Za-z\d@$!%*?&]+$/;

  // Check for leading/trailing spaces
  if (passwordInput !== password) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Password cannot contain spaces!";
    return false;
  }

  // No spaces
  if (password.includes(" ")) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Password cannot contain spaces!";
    return false;
  }
  // Only allowed characters
  else if (!allowed.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent =
      "❌ Password contains invalid characters! Only letters, numbers, and @$!%*?& are allowed.";
    return false;
  }
  // Minimum length
  else if (password.length < 8) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must be at least 8 characters!";
    return false;
  }
  // Lowercase check
  else if (!lower.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include a lowercase letter!";
    return false;
  }
  // Uppercase check
  else if (!upper.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include an uppercase letter!";
    return false;
  }
  // Digit check
  else if (!digit.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include a number!";
    return false;
  }
  // Special character check
  else if (!special.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent =
      "❌ Must include a special character (@, $, !, %, *, ?, &)";
    return false;
  }

  // All validations passed
  passwordErrorId.style.display = "none";
  passwordErrorId.textContent = "";

  // Confirm password check
  if (password !== cPassword && cPassword !== "") {
    cPasswordErrorId.style.display = "inline-block";
    cPasswordErrorId.textContent = "Passwords do not match";
    return false;
  } else {
    cPasswordErrorId.style.display = "none";
    cPasswordErrorId.textContent = "";
    return true;
  }
}

// 🔍 Validation function
function validateReferalCode() {
  const code = input.value.trim();

  if (!toggle.checked) return true; // skip if toggle is off

  if (!code) {
    showError("Referral code cannot be empty.");
    return false;
  }

  // ✅ Example pattern: only letters/numbers, 13 chars
  const pattern = /^[A-Z0-9]{13}$/;

  if (!pattern.test(code)) {
    showError("Invalid referral code. Use 13 numbers or letters (CAPITAL) only.");
    return false;
  }

  hideError();
  return true;
}

module.exports = {
  validateName,
  validatePassword,
  validate_Email,
  validatePhone,
  validateReferalCode,
}