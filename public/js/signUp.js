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

//Get Element By ID's
const nameId = $("name");
const emailId = $("email");
const phoneId = $("phone");
const passwordId = $("password");
const cPasswordId = $("confirmPassword");
const signupFormId = $("signupForm");

//Error id's
const nameErrorId = $("nameError");
const emailErrorId = $("emailError");
const phoneErrorId = $("phoneError");
const passwordErrorId = $("passwordError");
const cPasswordErrorId = $("cPasswordError");

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

document.addEventListener("DOMContentLoaded", () => {
  signupFormId.addEventListener("submit", (e) => {
    nameValidactionChecking();
    emailValidactionChecking();
    phoneValidactionChecking();
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
      !cPasswordErrorId
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
