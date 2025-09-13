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
  cPasswordErrorId = getId("cPasswordError");

// Password strength meter elements
const meter = getId("strengthMeter"),
  label = getId("strengthLabel");

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
    return false;
  } else {
    nameErrorId.style.display = "none";
    nameErrorId.textContent = "";
    return true;
  }
}

function validateEmail() {
  const email = emailId.value.trim();
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!pattern.test(email)) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.textContent = "Invalid email format!";
    return false;
  } else {
    emailErrorId.style.display = "none";
    emailErrorId.textContent = "";
    return true;
  }
}

function validatePhone() {
  let phone = phoneId.value.trim().replace(/^0+/, "");
  const pattern = /^[0-9]{10}$/;

  if (!pattern.test(phone)) {
    phoneErrorId.style.display = "inline-block";
    phoneErrorId.textContent = "Enter a valid 10-digit phone number!";
    return false;
  } else {
    phoneErrorId.style.display = "none";
    phoneErrorId.textContent = "";
    return true;
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
    return false;
  } else if (!lower.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include a lowercase letter!";
    return false;
  } else if (!upper.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include an uppercase letter!";
    return false;
  } else if (!digit.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include a number!";
    return false;
  } else if (!special.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent =
      "❌ Must include a special character (@, $, !, %, *, ?, &)";
    return false;
  } else {
    passwordErrorId.style.display = "none";
    passwordErrorId.textContent = "";
  }

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

// Real-time validation
nameId.addEventListener("input", validateName);
emailId.addEventListener("input", validateEmail);
phoneId.addEventListener("input", validatePhone);
passwordId.addEventListener("input", validatePassword);
cPasswordId.addEventListener("input", validatePassword);

// Submit handler
getId("submit").addEventListener("click", (e) => {
  e.preventDefault();

  // Run validations
  const valid =
    validateName() && validateEmail() && validatePhone() && validatePassword();

  if (!valid) {
    Swal.fire({
      icon: "error",
      title: "Invalid Input",
      text: "Please fix the errors before submitting!",
    });
    return;
  }

  const data = {
    name: nameId.value.trim(),
    email: emailId.value.trim(),
    phone: phoneId.value.trim().replace(/^0+/, ""),
    password: passwordId.value.trim(),
    cPassword: cPasswordId.value.trim(),
    rememberMe: getId("rememberMe")?.checked || false,
  };
console.log(data)
  fetch("/signUp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.success) {
        Swal.fire({
          icon: "info",
          title: "OTP Resent Successfully",
          text: "Please check your email for the new OTP.",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          window.location.href = "/Verify-otp";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
    })
    .catch(() => {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Failed to create an account. Try again!",
      });
    });
});
