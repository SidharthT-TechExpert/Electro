const getId = (id) => document.getElementById(id);

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const target = getId(icon.dataset.target);
    if (target.type === "password") {
      target.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      target.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
});

// Get form elements
const emailId = getId("email"),
  passwordId = getId("password"),
  loginFormId = getId("loginForm"),
  emailErrorId = getId("emailError"),
  passwordErrorId = getId("passwordError"),
  rememberMeId = getId("rememberMe");

// Email validation
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

// Password validation
function validatePassword() {
  const password = passwordId.value.trim();
  if (!password) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "Password is required!";
    return false;
  }
  passwordErrorId.style.display = "none";
  return true;
}

// Real-time validation
emailId.addEventListener("input", validateEmail);
passwordId.addEventListener("input", validatePassword);

// Submit handler
getId("submit").addEventListener("click", (e) => {
  e.preventDefault();

  // Run validations
  const valid = validateEmail() && validatePassword();
  if (!valid) {
    Swal.fire({
      icon: "error",
      title: "Invalid Input",
      text: "Please fix the errors before submitting!",
    });
    return;
  }

  const email = emailId.value.trim(),
    password = passwordId.value.trim(),
    rememberMe = rememberMeId.checked;

  // AJAX request
  $.ajax({
    type: "POST",
    url: "/logIn",
    data: { email, password, rememberMe },
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Login successful!",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          window.location.href = "/";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
    },
    error: function (xhr) {
      let msg = "Failed to Sign Up. Try again later!";
      if (xhr.responseJSON && xhr.responseJSON.message) {
        msg = xhr.responseJSON.message; // ✅ backend message
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    },
  });
});
