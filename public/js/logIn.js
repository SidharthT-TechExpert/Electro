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
  const Regexemail = emailId.value;
  const email = Regexemail.trim();

  // Check if email starts with a space
  if (Regexemail.startsWith(" ")) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.textContent =
      "❌ Email cannot start with a space. Please enter a valid email.";
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

// Password validation
function validatePassword() {
  const passwordInput = passwordId.value;
  const password = passwordInput.trim();

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
      icon: "warning",
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
  try {
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
            setTimeout(
              () => (window.location.href = response.redirect || "/"),
              500
            );
          });
        } else {
          Swal.fire({
            icon: response.info ? "warning" : "error",
            title: response.info ? "Warning" : "Error",
            text: response.message || "Login Error!",
            confirmButtonColor: "#3085d6",
          });
        }
      },
    });
  } catch (error) {
    console.error("Signup failed:", err);
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "Failed to Login Your account. Try again!",
      confirmButtonColor: "#3085d6",
    });
  }
});

// async function googleOAuth(redirectPath) {
//   try {
//     const response = await $.ajax({
//       type: "GET",
//       url: `/auth/google?redirect=${redirectPath}`,
//     });

//     if (response.success) {
//       // Show login success
//       await Swal.fire({
//         icon: "success",
//         title: "Logged in Successfully!",
//         showConfirmButton: false,
//         timer: 1200,
//       });

//       if (response.New) {
//         Swal.fire({
//           icon: "question",
//           title: "Set your one-time password",
//           html: `
//     <input type="password" id="password" class="swal2-input" placeholder="Enter Password">
//     <input type="password" id="cpassword" class="swal2-input" placeholder="Confirm Password">
//     <input type="text" id="referralCode" class="swal2-input" placeholder="Enter 13-character referral code (optional)">
//   `,
//           showCancelButton: false,
//           allowOutsideClick: false,
//           allowEscapeKey: false,
//           confirmButtonText: "Submit",
//           focusConfirm: false,
//           preConfirm: () => {
//             const password = document.getElementById("password").value.trim();
//             const cpassword = document.getElementById("cpassword").value.trim();
//             const referralCode = document
//               .getElementById("referralCode")
//               .value.trim()
//               .toUpperCase();

//             // Password validations
//             if (!password)
//               return Swal.showValidationMessage(
//                 "You need to enter a password!"
//               );

//             if (!/^[A-Za-z0-9\$&@!%_-]{8,}$/.test(password)) {
//               return Swal.showValidationMessage(
//                 "Password must be at least 8 characters and can only include letters, numbers, and symbols like $ & @ ! % _ -."
//               );
//             }

//             // Confirm password validations
//             if (!cpassword)
//               return Swal.showValidationMessage(
//                 "You need to confirm your password!"
//               );
//             if (password !== cpassword)
//               return Swal.showValidationMessage("Passwords do not match!");

//             // Referral code validations (optional)
//             if (referralCode && !/^[A-Z0-9]{13}$/.test(referralCode)) {
//               return Swal.showValidationMessage(
//                 "Referral code must be exactly 13 letters (Capital) or numbers!"
//               );
//             }

//             return { password, cpassword, referralCode }; // return object
//           },
//         }).then(async (result) => {
//           if (result.isConfirmed) {
//             const data = result.value; // { password, referralCode }

//             try {
//               const res = await axios.post("/Onetimepass", data);

//               if (res.success) {
//                 await Swal.fire({
//                   icon: "success",
//                   title: "Completed!",
//                   showConfirmButton: false,
//                   timer: 1200,
//                 });
//               } else {
//                 await Swal.fire({
//                   icon: "warning",
//                   title: "Failed to submit",
//                   showConfirmButton: false,
//                   timer: 1200,
//                 });
//               }
//             } catch (err) {
//               // Show error in a SweetAlert popup
//               Swal.fire({
//                 icon: "error",
//                 title: "Server Error",
//                 text:
//                   err.response?.data?.message ||
//                   "Failed to submit data. Please try again!",
//                 confirmButtonText: "OK",
//               });
//             }
//           }
//         });
//       }
//     } else {
//       Swal.fire({
//         icon: response.info ? "warning" : "error",
//         title: response.info ? "Warning" : "Error",
//         text: response.message || "Login Error!",
//         confirmButtonColor: "#3085d6",
//       });
//     }
//   } catch (error) {
//     console.error("Signup With Google failed:", error);
//     Swal.fire({
//       icon: "error",
//       title: "Server Error",
//       text: "Failed to login. Try again!",
//       confirmButtonColor: "#3085d6",
//     });
//   }
// }
