const $ = (id) => document.getElementById(id);

// Toggle password visibility
document.querySelectorAll(".toggle-pass").forEach((icon) => {
  icon.addEventListener("click", () => {
    const targetId = icon.getAttribute("data-target");
    const input = document.getElementById(targetId);

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

// ----------------- Password Toggle -----------------
document.addEventListener("DOMContentLoaded", () => {
  const toStep2Btn = $("toStep2");
  const step1 = $("step-1");
  const step2 = $("step-2");

  if (toStep2Btn) {
    toStep2Btn.addEventListener("click", () => {
      step1.classList.remove("active");
      step2.classList.add("active");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM is ready!");

  // ----------------- Variables -----------------
  let timer = null,
    DURATION = 50,
    remaining = DURATION;

  const step1 = $("step-1"),
    step2 = $("step-2"),
    step3 = $("step-3"),
    toStep2Btn = $("toStep2"),
    verifyOtpBtn = $("verifyOtpBtn"),
    resetBtn = $("resetBtn"),
    resendBtn = $("resendBtn"),
    otpInputs = [...document.querySelectorAll(".rc-otp")],
    timerFill = $("timerFill"),
    timerText = $("timerText"),
    passError = $("passError"),
    newPass = $("newPass"),
    confirmPass = $("confirmPass"),
    meter = $("strengthMeter"),
    label = $("strengthLabel"),
    identifier = $("identifier");

  // ----------------- Functions -----------------
  function startTimer() {
    clearInterval(timer);
    remaining = DURATION;
    timerFill.style.width = "100%";
    timerText.textContent = `⏳ ${remaining}s`;
    resendBtn.style.display = "none";

    timer = setInterval(() => {
      remaining--;
      timerFill.style.width = (remaining / DURATION) * 100 + "%";
      timerText.textContent =
        remaining > 0 ? `⏳ ${remaining}s` : "Resend available";

      if (remaining <= 0) {
        clearInterval(timer);
        resendBtn.style.display = "block";
        resendBtn.style.color = "#ffb08a";
      }
    }, 1000);
  }

  function resetOtpInputs() {
    otpInputs.forEach((i) => (i.value = ""));
    otpInputs[0].focus();
  }

  // ----------------- Step 1: Email Submit -----------------
  if (toStep2Btn) {
    toStep2Btn.addEventListener("click", async (e) => {
      e.preventDefault();

      const identifier = document.getElementById("identifier");
      const email = identifier.value.trim();
      if (!email) {
        Swal.fire({
          icon: "warning",
          title: "Required",
          text: "Please enter your email.",
        });
        return;
      }

      try {
        const res = await fetch("/admin/forgetPass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const response = await res.json();

        if (res.status === 200 && response.success) {
          Swal.fire({
            icon: "success",
            title: response.message,
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            step1.classList.remove("active");
            step2.classList.add("active");
            otpInputs[0].focus();
            startTimer();
          });
        } else if (res.status === 401 || response.isAdmin === false) {
          Swal.fire({
            icon: "error",
            title: "Unauthorized",
            text:
              response.message || "You are not allowed to perform this action.",
          }).then(() => {
            window.location.href = "/"; // redirect non-admin to user area
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Something went wrong.",
          });
        }
      } catch (err) {
        console.error("ForgetPass request failed:", err);
        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: "Please try again later.",
        });
      }
    });
  }

  // ----------------- Step 2: OTP Verification -----------------
  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const otp = otpInputs.map((i) => i.value).join("");
      if (otp.length < 6) return;

      fetch("/admin/passReset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: response.message,
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              step2.classList.remove("active");
              step3.classList.add("active");
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: response.message,
            });
            resetOtpInputs();
          }
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Invalid OTP?",
            text: "Please try again!",
          });
          resetOtpInputs();
        });
    });
  }

  // ----------------- Resend OTP -----------------
  if (resendBtn) {
    resendBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetOtpInputs();

      fetch("/admin/resend-Otp", { method: "POST" })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            Swal.fire({
              icon: "info",
              title: "New OTP sent",
              showConfirmButton: false,
              timer: 1200,
            });
            startTimer();
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: response.message,
            });
          }
        });
    });
  }

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
  if (newPass) {
    newPass.addEventListener("input", (e) => {
      const v = e.target.value;
      let s = 0;
      if (v.length >= 6) s++;
      if (/[A-Z]/.test(v)) s++;
      if (/[0-9]/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;

      const widths = [0, 25, 50, 75, 100],
        colors = ["#ff3d3d", "#ff8a3d", "#ffd54d", "#9be26b", "#4cd964"],
        texts = ["Too short", "Weak", "Okay", "Good", "Strong"];

      meter.style.width = widths[s] + "%";
      meter.style.background = colors[s];
      label.textContent = v ? texts[s] : "";
    });
  }

  // ----------------- Reset Password Submit -----------------
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const a = newPass.value.trim(),
        b = confirmPass.value.trim();

      if (!a || !b) {
        passError.style.display = "block";
        passError.textContent = "Fill both fields";
        return;
      }
      if (a !== b) {
        passError.style.display = "block";
        passError.textContent = "❌ Passwords do not match.";
        return;
      }

      // --- Strength Check ---
      let strength = 0;
      if (a.length >= 6) strength++;
      if (/[A-Z]/.test(a)) strength++;
      if (/[0-9]/.test(a)) strength++;
      if (/[^A-Za-z0-9]/.test(a)) strength++;

      if (strength < 4) {
        passError.style.display = "block";
        passError.textContent =
          "❌ Password is not strong enough. Use uppercase, number, special character, and at least 6 characters.";
        return;
      }

      passError.style.display = "none";

      fetch("/admin/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: a, cPassword: b }),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Password updated!",
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              window.location.href = "/admin/login";
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error!",
              text: response.message,
              showConfirmButton: true,
            });
          }
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Server error. Try again.!",
            text: response.message,
            showConfirmButton: true,
          });
        });
    });
  }
});
