const emailId = document.getElementById("identifier");
const emailErrorId = document.getElementById("emailError");

// Email validation
function validateEmail() {
  const rawEmail = emailId.value;
  const email = rawEmail.trim();

  if (!email) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.textContent = "❌ Email cannot be empty.";
    return false;
  }

  // Leading/trailing space check
  if (rawEmail !== email) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.textContent = "❌ Email cannot start or end with a space.";
    return false;
  }

  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(email)) {
    emailErrorId.style.display = "inline-block";
    emailErrorId.textContent =
      "❌ Please enter a valid email (e.g., user@example.com).";
    return false;
  }

  emailErrorId.style.display = "none";
  emailErrorId.textContent = "";
  return true;
}

// Real-time validation
emailId.addEventListener("input", validateEmail);

// Step 1: Submit Email
function Reset(f) {
  const submitBtn = f.querySelector('[type="submit"]');
  submitBtn.disabled = true;

  const email = emailId.value.trim();

  if (!validateEmail()) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Input",
      text: "Please fix the errors before submitting!",
    });
    submitBtn.disabled = false;
    return;
  }

  $.ajax({
    type: "POST",
    url: "/forgotPass",
    data: { email, isOTP: false },
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: response.message,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          $("#step-1").removeClass("active");
          $("#step-2").addClass("active");
          $(".rc-otp").first().focus();
          startTimer();
        });
      } else {
        if (response.info) {
          Swal.fire({
            icon: "warning",
            title: "Warring",
            text: response.message,
          });
          submitBtn.disabled = false;
          return;
        }
        Swal.fire({ icon: "error", title: "Error", text: response.message });
      }
    },
    error: function () {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Please dtry again!",
      });
      f.submit.disabled = false;
      return;
    },
  });
}

$(document).ready(function () {
  // ----------------- Variables -----------------
  const emailId = document.getElementById("identifier");
  const emailErrorId = document.getElementById("emailError");

  const step1 = $("#step-1"),
    step2 = $("#step-2"),
    step3 = $("#step-3"),
    verifyOtpBtn = $("#verifyOtpBtn"),
    resetBtn = $("#resetBtn"),
    resendBtn = $("#resendBtn"),
    otpInputs = Array.from(document.querySelectorAll(".rc-otp")), // convert to array
    timerFill = $("#timerFill"),
    timerText = $("#timerText"),
    passError = $("#passError"),
    newPass = $("#newPass"),
    confirmPass = $("#confirmPass"),
    meter = $("#strengthMeter"),
    label = $("#strengthLabel");

  let timer = null,
    DURATION = 50,
    remaining = DURATION;

  // ----------------- Email Validation -----------------
  function validateEmail() {
    const rawEmail = emailId.value;
    const email = rawEmail.trim();

    if (!email) {
      emailErrorId.style.display = "inline-block";
      emailErrorId.textContent = "❌ Email cannot be empty.";
      return false;
    }

    if (rawEmail !== email) {
      emailErrorId.style.display = "inline-block";
      emailErrorId.textContent = "❌ Email cannot start or end with a space.";
      return false;
    }

    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
      emailErrorId.style.display = "inline-block";
      emailErrorId.textContent =
        "❌ Please enter a valid email (e.g., user@example.com).";
      return false;
    }

    emailErrorId.style.display = "none";
    emailErrorId.textContent = "";
    return true;
  }

  emailId.addEventListener("input", validateEmail);

  // ----------------- Timer -----------------
  function startTimer() {
    clearInterval(timer);
    remaining = DURATION;
    timerFill.css("width", "100%");
    timerText.text(`⏳ ${remaining}s`);
    resendBtn.hide();

    timer = setInterval(() => {
      remaining--;
      timerFill.css("width", (remaining / DURATION) * 100 + "%");
      timerText.text(remaining > 0 ? `⏳ ${remaining}s` : "Resend available");

      if (remaining <= 0) {
        clearInterval(timer);
        resendBtn.show().css("color", "#ffb08a");
      }
    }, 1000);
  }

  function resetOtpInputs() {
    otpInputs.forEach((i) => (i.value = ""));
    if (otpInputs.length) otpInputs[0].focus();
  }

  // ----------------- Step 1: Email Submit -----------------
  $("#step-1 form").on("submit", function (e) {
    e.preventDefault();
    const form = $(this);
    const submitBtn = form.find("button[type='submit']");

    const email = emailId.value.trim();
    if (!email) return;

    if (!validateEmail()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: "Please fix the errors before submitting!",
        showConfirmButton: true,
      });
      submitBtn.prop("disabled", false);
      return;
    }

    submitBtn.prop("disabled", true);

    $.ajax({
      type: "POST",
      url: "/forgotPass",
      data: { email, isOTP: true },
      success: function (response) {
        submitBtn.prop("disabled", false);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: response.message,
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            step1.removeClass("active");
            step2.addClass("active");
            if (otpInputs.length) otpInputs[0].focus();
            startTimer();
          });
        } else if (response.info) {
          Swal.fire({
            icon: "warning",
            title: "Warning",
            text: response.message,
          });
        } else {
          Swal.fire({ icon: "error", title: "Error", text: response.message });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Please try again!",
        });
        submitBtn.prop("disabled", false);
      },
    });
  });

  // ----------------- Step 2: OTP -----------------
  verifyOtpBtn.on("click", function (e) {
    e.preventDefault();
    const otp = otpInputs.map((i) => i.value).join("");
    if (otp.length < 6) return;

    $.ajax({
      type: "POST",
      url: "/passReset",
      data: { otp },
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: response.message,
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            step2.removeClass("active");
            step3.addClass("active");
          });
        } else {
          Swal.fire({ icon: "error", title: "Error", text: response.message });
          resetOtpInputs();
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Invalid OTP?",
          text: "Please try again!",
        });
        resetOtpInputs();
      },
    });
  });

  // ----------------- Resend OTP -----------------
  resendBtn.on("click", function (e) {
    e.preventDefault();
    resetOtpInputs();

    $.ajax({
      type: "POST",
      url: "/resend-Otp",
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "New OTP sented!",
            showConfirmButton: false,
            timer: 1200,
          });
          startTimer();
        } else {
          Swal.fire({ icon: "error", title: "Error", text: response.message });
        }
      },
    });
  });

  // ----------------- OTP Input Navigation -----------------
  otpInputs.forEach((input, i) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && i > 0)
        otpInputs[i - 1].focus();
    });
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
      pasted.split("").forEach((c, j) => {
        if (otpInputs[j]) otpInputs[j].value = c;
      });
    });
  });

  // ----------------- Password Strength -----------------
  newPass.on("input", function () {
    const v = $(this).val();
    let s = 0;
    if (v.length >= 6) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;

    const widths = [0, 25, 50, 75, 100],
      colors = ["#ff3d3d", "#ff8a3d", "#ffd54d", "#9be26b", "#4cd964"],
      texts = ["Too short", "Weak", "Okay", "Good", "Strong"];

    meter.css({ width: widths[s] + "%", background: colors[s] });
    label.text(v ? texts[s] : "");
  });

  // ----------------- Reset Password -----------------
  resetBtn.on("click", function (e) {
    e.preventDefault();
    const a = newPass.val().trim(),
      b = confirmPass.val().trim();

    if (!a || !b) {
      passError.show().text("Fill both fields");
      return;
    }
    if (a !== b) {
      passError.show().text("❌ Passwords do not match.");
      return;
    }

    let strength = 0;
    if (a.length >= 6) strength++;
    if (/[A-Z]/.test(a)) strength++;
    if (/[0-9]/.test(a)) strength++;
    if (/[^A-Za-z0-9]/.test(a)) strength++;

    if (strength < 4) {
      passError
        .show()
        .text(
          "❌ Password is not strong enough. Use uppercase, number, special character, and at least 6 characters."
        );
      return;
    }

    passError.hide();

    $.ajax({
      type: "POST",
      url: "/update-password",
      data: { password: a, cPassword: b },
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Password updated!",
            showConfirmButton: false,
            timer: 1500,
          }).then(() => (window.location.href = "/login"));
        } else {
          passError.show().text(response.message || "Something went wrong");
        }
      },
      error: function () {
        passError.show().text("Server error. Try again.");
      },
    });
  });

  // ----------------- Toggle Password Visibility -----------------
  $(".toggle-pass").on("click", function () {
    const targetId = $(this).data("target");
    const input = $("#" + targetId);

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      $(this).removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
      input.attr("type", "password");
      $(this).removeClass("fa-eye-slash").addClass("fa-eye");
    }
  });
});
