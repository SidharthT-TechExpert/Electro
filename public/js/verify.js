(function () {
  const otpInputs = [...document.querySelectorAll(".rc-otp")],
        otpError = document.getElementById("otpError"),
        timerFill = document.getElementById("timerFill"),
        timerText = document.getElementById("timerText"),
        resendBtn = document.getElementById("resendBtn");

  const DEMO_OTP = "123456"; // Replace with your actual OTP
  let timer = null,
      DURATION = 30,
      remaining = DURATION;

  function verifyOTP() {
    const otp = otpInputs.map(i => i.value).join("");
    if (otp.length < 6) return; // Wait until all digits entered
    if (otp !== DEMO_OTP) {
      otpError.style.display = "block";
      otpError.textContent = "❌ Invalid OTP. Try again.";
      otpInputs.forEach(i => i.value = "");
      otpInputs[0].focus();
      return;
    }
    otpError.style.display = "none";
    alert("✅ OTP Verified Successfully!");
  }

  // --- OTP input behavior ---
  otpInputs.forEach((input, i) => {
    input.addEventListener("input", e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();

      // Auto-submit when 6 digits entered
      if (otpInputs.every(i => i.value)) verifyOTP();
    });

    input.addEventListener("keydown", e => {
      if (e.key === "Backspace" && !input.value && i > 0) otpInputs[i - 1].focus();
    });

    input.addEventListener("paste", e => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
      pasted.split("").forEach((c, j) => {
        if (otpInputs[j]) otpInputs[j].value = c;
      });
      otpInputs[Math.min(pasted.length - 1, otpInputs.length - 1)].focus();
      // Auto-submit if all 6 digits pasted
      if (otpInputs.every(i => i.value)) verifyOTP();
    });
  });

  // --- Timer ---
  function startTimer() {
    clearInterval(timer);
    remaining = DURATION;
    timerFill.style.width = "100%";
    timerText.textContent = `⏳ ${remaining}s`;
    resendBtn.style.display = "none";

    timer = setInterval(() => {
      remaining--;
      timerFill.style.width = (remaining / DURATION) * 100 + "%";
      timerText.textContent = remaining > 0 ? `⏳ ${remaining}s` : "Resend available";

      if (remaining <= 0) {
        clearInterval(timer);
        resendBtn.style.display = "block";
        resendBtn.style.color = "#ffb08a";
      }
    }, 1000);
  }

  // --- Resend OTP ---
  resendBtn.addEventListener("click", e => {
    e.preventDefault();
    otpInputs.forEach(i => i.value = "");
    otpInputs[0].focus();
    startTimer();
    alert("OTP resent (demo)"); // Replace with API call
  });

  // --- Init ---
  startTimer();
  otpInputs[0].focus();
})();
