(function () {
  const otpInputs = [...document.querySelectorAll(".rc-otp")],
        otpError = document.getElementById("otpError"),
        timerFill = document.getElementById("timerFill"),
        timerText = document.getElementById("timerText"),
        resendBtn = document.getElementById("resendBtn"),
        submitBtn = document.getElementById("verifyOtpBtn");

  let timer = null,
      DURATION = 60,
      remaining = DURATION;

  // --- Verify OTP AJAX ---
  function verifyOTP() {
    const otp = otpInputs.map(i => i.value).join("");
    if (otp.length < 6) return; // wait for full input
    otpError.style.display = "none";

    $.ajax({
      type: "POST",
      url: "/verify-Otp",
      data: { otp: otp },
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "OTP Verified Successfully",
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            window.location.href = response.redirectUrl;
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message,
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Invalid OTP ?",
          text: "Please Try Again!",
        });
      },
    });
    return false;
  }

  // --- OTP Input Behavior ---
  otpInputs.forEach((input, i) => {
    input.addEventListener("input", e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();

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

  // --- Button click ---
  submitBtn.addEventListener("click", e => {
    e.preventDefault();
    verifyOTP();
  });

  // --- Resend ---
  resendBtn.addEventListener("click", e => {
    e.preventDefault();
    otpInputs.forEach(i => i.value = "");
    otpInputs[0].focus();
    startTimer();
    alert("OTP resent (demo)"); // replace with API call
  });

  // --- Init ---
  startTimer();
  otpInputs[0].focus();
})();
