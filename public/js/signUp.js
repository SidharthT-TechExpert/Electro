// Helper Get element by ID
const $ = (id) => document.getElementById(id);

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = $(icon.getAttribute("data-target"));
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
    const input = $(icon.getAttribute("data-target"));
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
const nameId = $("name"),
  emailId = $("email"),
  phoneId = $("phone"),
  passwordId = $("password"),
  cPasswordId = $("cPassword"),
  signupFormId = $("signupForm"),
  nameErrorId = $("nameError"),
  emailErrorId = $("emailError"),
  phoneErrorId = $("phoneError"),
  passwordErrorId = $("passwordError"),
  cPasswordErrorId = $("cPasswordError");

// Password strength meter elements
const meter = $("strengthMeter"),
  label = $("strengthLabel");

// Password strength meter
passwordId.addEventListener("input", () => {
  const v = passwordId.value;
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;

  const w = [0, 25, 50, 75, 100],
    c = ["#ff3d3d", "#ff8a3d", "#ffd54d", "#9be26b", "#4cd964"],
    t = ["Too short", "Weak", "Okay", "Good", "Strong"];

  meter.style.width = w[s] + "%";
  meter.style.background = c[s];
  label.textContent = v ? t[s] : "";
  label.style.color = v ? c[s] : "red";
});

// Validation functions
function validateName() {
  const name = nameId.value.trim();
  const pattern = /^[A-Za-z\s]+$/;

  if (!pattern.test(name)) {
    nameErrorId.style.display = "inline-block";
    nameErrorId.textContent = "Name can only contain alphabets & spaces!";
  } else {
    nameErrorId.style.display = "none";
    nameErrorId.textContent = "";
  }
}

function validateEmail() {
  const email = emailId.value.trim();
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!pattern.test(email)) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.textContent = "Invalid email format!";
  } else {
    emailErrorId.style.display = "none";
    emailErrorId.textContent = "";
  }
}

function validatePhone() {
  let phone = phoneId.value.trim().replace(/^0+/, "");
  const pattern = /^[0-9]{10}$/;

  if (!pattern.test(phone)) {
    phoneErrorId.style.display = "inline-block";
    phoneErrorId.textContent = "Enter a valid 10-digit phone number!";
  } else {
    phoneErrorId.style.display = "none";
    phoneErrorId.textContent = "";
  }
}

function validatePassword() {
  const password = passwordId.value.trim();
  const cPassword = cPasswordId.value.trim();
  const lower = /[a-z]/,
    upper = /[A-Z]/,
    digit = /\d/,
    special = /[@$!%*?&]/;

  if (password.length < 8) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must be at least 8 characters!";
  } else if (!lower.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include a lowercase letter!";
  } else if (!upper.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include an uppercase letter!";
  } else if (!digit.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include a number!";
  } else if (!special.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent =
      "❌ Must include a special character (@, $, !, %, *, ?, &)";
  } else {
    passwordErrorId.style.display = "none";
    passwordErrorId.textContent = "";
  }

  // Confirm password check
  if (password !== cPassword && cPassword !== "") {
    cPasswordErrorId.style.display = "inline-block";
    cPasswordErrorId.textContent = "Passwords do not match";
  } else {
    cPasswordErrorId.style.display = "none";
    cPasswordErrorId.textContent = "";
  }
}

// Real-time validation
nameId.addEventListener("input", validateName);
emailId.addEventListener("input", validateEmail);
phoneId.addEventListener("input", validatePhone);
passwordId.addEventListener("input", validatePassword);
cPasswordId.addEventListener("input", validatePassword);

// Form submit validation
signupFormId.addEventListener("submit", (e) => {
  validateName();
  validateEmail();
  validatePhone();
  validatePassword();

  const hasErrors =
    nameErrorId.textContent ||
    emailErrorId.textContent ||
    phoneErrorId.textContent ||
    passwordErrorId.textContent ||
    cPasswordErrorId.textContent;

  if (hasErrors) {
    e.preventDefault();
  }
});
