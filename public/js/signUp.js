// Helper Get element by ID
const getId = (id) => document.getElementById(id);

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = getId(icon.getAttribute("data-target"));
    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
});

document.querySelectorAll(".ctoggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = getId(icon.getAttribute("data-target"));
    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-lock", "fa-unlock");
    } else {
      input.type = "password";
      icon.classList.replace("fa-unlock", "fa-lock");
    }
  });
});

// Get form elements
const nameId = getId("name"),
  emailId = getId("email"),
  phoneId = getId("phone"),
  passwordId = getId("password"),
  cPasswordId = getId("cPassword"),
  signupFormId = getId("signupForm"),
  nameErrorId = getId("nameError"),
  emailErrorId = getId("emailError"),
  phoneErrorId = getId("phoneError"),
  passwordErrorId = getId("passwordError"),
  cPasswordErrorId = getId("cPasswordError"),
  //For ReferralCode Toggle
  toggle = getId("referralToggle"),
  field = getId("referralField"),
  input = getId("referralCode"),
  error = getId("referralError"),
  // Password strength meter elements
  meter = getId("strengthMeter"),
  label = getId("strengthLabel");

// Password strength meter
passwordId.addEventListener("input", () => {
  const v = passwordId.value;
  let s = 0;

  // Length check
  if (v.length >= 8) s++;

  // Uppercase
  if (/[A-Z]/.test(v)) s++;

  // Digit
  if (/[0-9]/.test(v)) s++;

  // Special character (only allowed ones, ignore spaces)
  if (/[@$!%*?&]/.test(v)) s++;

  const w = [0, 25, 50, 75, 100],
    c = ["#ff3d3d", "#ff8a3d", "#ffd54d", "#9be26b", "#4cd964"],
    t = ["Too short", "Weak", "Okay", "Good", "Strong"];

  meter.style.width = w[s] + "%";
  meter.style.background = c[s];
  label.textContent = v ? t[s] : "";
  label.style.color = v ? c[s] : "red";
});

//referral Code Toggle Check / un update
toggle.addEventListener("change", () => {
  if (toggle.checked) {
    field.style.display = "block";
    setTimeout(() => input.focus(), 100);
  } else {
    field.style.display = "none";
    input.value = "";
    error.style.display = "none";
  }
});

// Validation functions
function validateName() {
  const nameInput = nameId.value;
  const name = nameId.value.trim();

  const pattern = /^[A-Za-z\s]{3,30}$/;

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

// Real-time validation
nameId.addEventListener("input", validateName);
emailId.addEventListener("input", validate_Email);
phoneId.addEventListener("input", validatePhone);
passwordId.addEventListener("input", validatePassword);
cPasswordId.addEventListener("input", validatePassword);
input.addEventListener("input", validateReferalCode);

//Submit Validation
getId("submit").addEventListener("click", async (e) => {
  e.preventDefault();

  const submitBtn = getId("submit");
  submitBtn.disabled = true; // prevent double click

  // Run validations
  const valid =
    validateName(e) &&
    validate_Email(e) &&
    validatePhone(e) &&
    validatePassword(e) &&
    validateReferalCode(e);

  if (!valid) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Input",
      text: "Please fix the errors before submitting!",
      confirmButtonColor: "#3085d6",
    });
    submitBtn.disabled = false;
    return;
  }

  const data = {
    name: nameId.value.trim(),
    email: emailId.value.trim(),
    phone: phoneId.value.trim(),
    password: passwordId.value.trim(),
    cPassword: cPasswordId.value.trim(),
    referalCode:input.value.trim(),
  };

  const redirectPath = getId("redirectInput").value || "/";

  try {
    const res = await fetch("/signUp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, redirect: redirectPath }),
    });

    const response = await res.json();

    if (response.success) {
      Swal.fire({
        icon: "success",
        title: "Account Validated",
        text: "Please check your email for the OTP.",
        showConfirmButton: false,
        timer: 2500,
      }).then(() => {
        // Redirect to OTP verification page
        const redirectUrl = response.redirect || "/";
        window.location.href = `/Verify-otp?redirect=${encodeURIComponent(
          redirectUrl
        )}`;
      });
    } else {
      Swal.fire({
        icon: response.info ? "warning" : "error",
        title: response.info ? "Warning" : "Error",
        text: response.message,
        confirmButtonColor: "#3085d6",
      });
    }
  } catch (err) {
    console.error("Signup failed:", err);
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "Failed to create an account. Try again!",
      confirmButtonColor: "#3085d6",
    });
  } finally {
    submitBtn.disabled = false; // re-enable button
  }
});

function showError(msg) {
  error.textContent = "❌ " + msg;
  error.style.display = "block";
}

function hideError() {
  error.textContent = "";
  error.style.display = "none";
}
