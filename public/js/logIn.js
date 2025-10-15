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
  const redirectPath = document.getElementById("redirectInput").value;

  $.ajax({
    url: "/logIn",
    type: "POST",
    data: {
      email,
      password,
      rememberMe,
      redirect: redirectPath,
    },
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Logged in Successfully!",
          showConfirmButton: false,
          timer: 1200,
        }).then(() => {
          // Show overlay
          const overlay = document.createElement("div");
          overlay.style.position = "fixed";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.background = "#fff";
          overlay.style.zIndex = "9999";
          overlay.style.opacity = "0";
          overlay.style.transition = "opacity 0.5s";
          document.body.appendChild(overlay);

          // Fade in overlay then redirect
          requestAnimationFrame(() => (overlay.style.opacity = "1"));
          setTimeout(() => (window.location.href = response.redirect || "/"), 500);
        });
      }
    },
  });
});
