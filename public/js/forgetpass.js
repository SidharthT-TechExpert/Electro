// Toggle password visibility using Font Awesome
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

$(document).ready(function () {
  // ----------------- Variables -----------------
  let timer = null,
    DURATION = 50,
    remaining = DURATION;

  const step1 = $("#step-1"),
    step2 = $("#step-2"),
    step3 = $("#step-3"),
    toStep2Btn = $("#toStep2"),
    verifyOtpBtn = $("#verifyOtpBtn"),
    resetBtn = $("#resetBtn"),
    resendBtn = $("#resendBtn"),
    otpInputs = [...document.querySelectorAll(".rc-otp")],
    timerFill = $("#timerFill"),
    timerText = $("#timerText"),
    passError = $("#passError"),
    newPass = $("#newPass"),
    confirmPass = $("#confirmPass"),
    meter = $("#strengthMeter"),
    label = $("#strengthLabel");

  // ----------------- Functions -----------------
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
    otpInputs[0].focus();
  }

  // ----------------- Step 1: Email Submit -----------------
  $("#step-1 form").on("submit", function (e) {
    e.preventDefault();
    const email = $("#identifier").val().trim();
    if (!email) return;

    $.ajax({
      type: "POST",
      url: "/forgetPass",
      data: { email },
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: response.message,
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            step1.removeClass("active");
            step2.addClass("active");
            otpInputs[0].focus();
            startTimer();
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
      },
    });
  });

  // ----------------- Step 2: OTP Verification -----------------
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
            icon: "info",
            title: "New OTP sent",
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

  // ----------------- OTP Input Behavior -----------------
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

  // ----------------- Step 3: Password Strength -----------------
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

// ----------------- Reset Password Submit with Strength Check -----------------
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

  // --- Strength Check ---
  let strength = 0;
  if (a.length >= 6) strength++;
  if (/[A-Z]/.test(a)) strength++;
  if (/[0-9]/.test(a)) strength++;
  if (/[^A-Za-z0-9]/.test(a)) strength++;

  if (strength < 4) {
    passError.show().text("❌ Password is not strong enough. Use uppercase, number, special character, and at least 6 characters.");
    return;
  }

  passError.hide();

  $.ajax({
    type: "POST",
    url: "/update-password",
    data: { password: a },
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Password updated!",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = "/login";
        });
      } else {
        passError.show().text(response.message || "Something went wrong");
      }
    },
    error: function () {
      passError.show().text("Server error. Try again.");
    },
  });
});

});
