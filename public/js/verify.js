(function () {
  const otpInputs = [...document.querySelectorAll(".rc-otp")],
    otpError = document.getElementById("otpError"),
    timerFill = document.getElementById("timerFill"),
    timerText = document.getElementById("timerText"),
    resendBtn = document.getElementById("resendBtn"),
    submitBtn = document.getElementById("verifyOtpBtn"),
    redirectInput = document.getElementById("redirectInput");

  const redirectPath = redirectInput?.value || "/";
  const DURATION = 30; // seconds
  let remaining = DURATION;
  let timer = null;

  // 🔒 Locks
  let isResending = false;
  let isVerifying = false;

  // --- Ensure resend hidden at start ---
  resendBtn.style.display = "none";
  resendBtn.disabled = true;

  // --- Timer ---
  function startTimer() {
    clearInterval(timer);
    remaining = DURATION;
    timerFill.style.width = "100%";
    timerText.textContent = `⏳ ${remaining}s`;
    resendBtn.style.display = "none";
    resendBtn.disabled = true;

    timer = setInterval(() => {
      remaining--;
      timerFill.style.width = (remaining / DURATION) * 100 + "%";
      timerText.textContent =
        remaining > 0 ? `⏳ ${remaining}s` : "Resend available";

      if (remaining <= 0) {
        clearInterval(timer);
        resendBtn.style.display = "block";
        resendBtn.disabled = false;
      }
    }, 1000);
  }

  // --- Safe Resend OTP ---
  resendBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (isResending) return; // 🔒 Stop instantly
    isResending = true;

    resendBtn.disabled = true;
    resendBtn.style.pointerEvents = "none";
    resendBtn.style.opacity = "0.6";
    resendBtn.style.cursor = "not-allowed";

    const originalText = resendBtn.textContent;
    resendBtn.textContent = "Sending...";

    try {
      const response = await $.ajax({
        type: "POST",
        url: "/resend-otp",
        data: { redirect: redirectPath },
      });

      if (response.success) {
        await Swal.fire({
          icon: "info",
          title: "OTP Resent Successfully",
          text: "Please check your email for the new OTP.",
          showConfirmButton: false,
          timer: 2000,
        });

        otpInputs.forEach((i) => (i.value = ""));
        otpInputs[0].focus();
        otpError.style.display = "none";
        startTimer();
      } else {
        await Swal.fire({
          icon: "warning",
          title: "Warning",
          text: response.message || "Unable to resend OTP.",
        });
      }
    } catch (err) {
      const msg =
        (err.responseJSON && err.responseJSON.message) ||
        err.responseText ||
        "Failed to resend OTP. Try again!";
      await Swal.fire({
        icon: "error",
        title: "Server Error",
        text: msg,
      });
    } finally {
      resendBtn.textContent = originalText;
      resendBtn.style.pointerEvents = "auto";
      resendBtn.style.opacity = "1";
      resendBtn.style.cursor = "pointer";
      resendBtn.disabled = false;
      isResending = false; // 🔓 unlock safely
    }
  });

  // --- Verify OTP ---
  async function verifyOTP() {
    if (isVerifying) return; // 🔒 prevent multiple submissions
    const otp = otpInputs.map((i) => i.value).join("");
    if (otp.length < 6) return;

    isVerifying = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying...";

    try {
      const response = await $.ajax({
        type: "POST",
        url: "/verify-Otp",
        data: { otp, redirect: redirectPath },
      });

      if (response.success) {
        await Swal.fire({
          icon: "success",
          title: "OTP Verified Successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        const redirectUrl = response.redirectUrl || "/";
        const encoded = encodeURIComponent(redirectUrl);
        window.location.href = `/logIn/?redirect=${encoded}`;
      } else {
        await Swal.fire({
          icon: "warning",
          title: "Warning",
          text: response.message || "Invalid OTP!",
        });
      }
    } catch (err) {
      const msg =
        (err.responseJSON && err.responseJSON.message) ||
        err.responseText ||
        "Failed to verify OTP. Try again!";
      await Swal.fire({
        icon: "error",
        title: "Server Error",
        text: msg,
      });
    } finally {
      isVerifying = false; // 🔓 unlock
      submitBtn.disabled = false;
      submitBtn.textContent = "Verify OTP";
    }
  }

  // --- OTP Input Behavior ---
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
      otpInputs[Math.min(pasted.length - 1, otpInputs.length - 1)].focus();
    });
  });

  // --- Submit click ---
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    verifyOTP();
  });

  // --- Init ---
  startTimer();
  otpInputs[0].focus();
})();
