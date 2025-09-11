// Helper Get element ID
const $ = (id) => document.getElementById(id);

// Toggle password
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const targetId = icon.getAttribute("data-target");
    const input = $(targetId);

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

document.querySelectorAll(".ctoggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const targetId = icon.getAttribute("data-target");
    const input = $(targetId);

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-lock");
      icon.classList.add("fa-unlock");
    } else {
      input.type = "password";
      icon.classList.remove("fa-unlock");
      icon.classList.add("fa-lock");
    }
  });
});

//Sign Up Validaction Started hear

//Get Element By ID's
const nameId = $("name"),
  emailId = $("email"),
  phoneId = $("phone"),
  passwordId = $("password"),
  cPasswordId = $("confirmPassword"),
  signupFormId = $("signupForm"),
  //Error id's
  nameErrorId = $("nameError"),
  emailErrorId = $("emailError"),
  phoneErrorId = $("phoneError"),
  passwordErrorId = $("passwordError"),
  cPasswordErrorId = $("cPasswordError");

//Password strangth checking
const meter = document.getElementById("strengthMeter"),
  label = document.getElementById("strengthLabel");

passwordId.addEventListener("input", () => {
  const v = passwordId.value;
  let s = 0;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  if (v.length >= 6) s++;
  const w = [0, 25, 50, 75, 100],
    c = ["#ff3d3d", "#ff8a3d", "#ffd54d", "#9be26b", "#4cd964"],
    t = ["Too short", "Weak", "Okay", "Good", "Strong"];
  meter.style.width = w[s] + "%";
  meter.style.background = c[s];
  label.textContent = v ? t[s] : "";
  label.style.color = v ? c[s] : "red";
});

const nameValidactionCIdhecking = (e) => {
  const name = nameId.value.trim();
  //name pattern
  const namePattern = /^[A-Za-z\s]+$/;

  if (!namePattern.test(name)) {
    nameError.style.display = "inline-block";
    nameError.innerHTML = "Name only contain alphabets & spaces!";
  } else {
    nameError.style.display = "none";
    nameError.innerHTML = "";
  }
};

const emailValidactionChecking = (e) => {
  const email = emailId.value.trim();
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(email)) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.innerHTML = "Invalid Format!";
  } else {
    emailErrorId.style.display = "none";
    emailErrorId.innerHTML = "";
  }
};

const phoneValidactionChecking = (e) => {
  let phone = phoneId.value.trim();
  phone = phone.replace(/^0+/, "");
  const phonePattern = /^[0-9]{10}$/;

  if (!phonePattern.test(phone)) {
    phoneErrorId.style.display = "inline-block";
    phoneErrorId.innerHTML = "Enter a valid 10-digit phone number!<";
  } else {
    phoneErrorId.style.display = "none";
    phoneErrorId.innerHTML = "";
  }
};

const passwordValidactionChecking = (e) => {
  const password = passwordId.value.trim(),
    cPassword = cPasswordId.value.trim(),
    lower = /[a-z]/,
    upper = /[A-Z]/,
    digit = /\d/,
    special = /[@$!%*?&]/;

  if (password.length < 8) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.innerHTML = "❌ Must be at least 8 characters!";
  } else if (!lower.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.innerHTML = "❌ Must include a lowercase letter!";
  } else if (!upper.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.innerHTML = "❌ Must include an uppercase letter!";
  } else if (!digit.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.innerHTML = "❌ Must include a number!";
  } else if (!special.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.innerHTML =
      "❌ Must include a special character (@, $, !, %, *, ?, &)";
  } else {
    passwordErrorId.style.display = "none";
    passwordErrorId.innerHTML = "";
  }

  if (password != cPassword) {
    cPasswordErrorId.style.display = "inline-block";
    cPasswordErrorId.innerHTML = "Passwords do not match";
  } else {
    cPasswordErrorId.style.display = "none";
    cPasswordErrorId.innerHTML = "";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  signupFormId.addEventListener("submit", (e) => {
    nameValidactionChecking();
    emailValidactionChecking();
    phoneValidactionChecking();
    passwordValidactionChecking();

    if (
      !nameId ||
      !emailId ||
      !phoneId ||
      !passwordId ||
      !cPasswordId ||
      !nameErrorId ||
      !emailErrorId ||
      !phoneErrorId ||
      !passwordErrorId ||
      cPasswordErrorId
    ) {
      console.error("One or more elements not found ");
    }

    if (
      !nameErrorId.innerHTML ||
      !emailErrorId.innerHTML ||
      !phoneErrorId.innerHTML ||
      !passwordErrorId.innerHTML ||
      !cPasswordErrorId.innerHTML
    ) {
      e.preventDefault();
    }
  });
});
