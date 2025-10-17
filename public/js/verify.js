(function () {
  const otpInputs = [...document.querySelectorAll(".rc-otp")],
    otpError = document.getElementById("otpError"),
    timerFill = document.getElementById("timerFill"),
    timerText = document.getElementById("timerText"),
    resendBtn = document.getElementById("resendBtn"),
    submitBtn = document.getElementById("verifyOtpBtn"),
    redirectInput = document.getElementById("redirectInput");

  const redirectPath = redirectInput?.value || "/";
  let timer = null;
  const DURATION = 30; // ⏳ change duration if needed
  let remaining = DURATION;

  // --- Verify OTP AJAX
  function verifyOTP() {
    const otp = otpInputs.map((i) => i.value).join("");
    if (otp.length < 6) return; // require full 6 digits
    otpError.style.display = "none";

    $.ajax({
      type: "POST",
      url: "/verify-Otp",
      data: { otp, redirect: redirectPath },
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "OTP Verified Successfully",
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            // Use encodeURIComponent to safely encode the redirect URL
            const redirectUrl = response.redirectUrl || "/";
            const encodedUrl = encodeURIComponent(redirectUrl);
            window.location.href = `/logIn/?redirect=${encodedUrl}`;
          });
        } else {
          Swal.fire({
            icon: "Warning",
            title: "Warning",
            text: response.message || "Invalid OTP!",
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("OTP Verification failed:", {
          status: jqXHR.status,
          statusText: jqXHR.statusText,
          responseText: jqXHR.responseText,
          responseJSON: jqXHR.responseJSON,
          textStatus,
          errorThrown,
        });

        const serverMsg =
          (jqXHR.responseJSON && jqXHR.responseJSON.message) ||
          (jqXHR.responseText && jqXHR.responseText) ||
          "Failed to verify OTP. Try again!";

        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: serverMsg,
        });
      },
    });

    return false;
  }

  // --- OTP Input Behavior ---
  otpInputs.forEach((input, i) => {
    // Only allow numbers & move focus
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      if (e.target.value && i < otpInputs.length - 1) {
        otpInputs[i + 1].focus();
      }
    });

    // Backspace: move back
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && i > 0) {
        otpInputs[i - 1].focus();
      }
    });

    // Paste: fill all digits
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
      pasted.split("").forEach((c, j) => {
        if (otpInputs[j]) otpInputs[j].value = c;
      });
      otpInputs[Math.min(pasted.length - 1, otpInputs.length - 1)].focus();
    });
  });

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

  // --- Submit button click ---
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    verifyOTP();
  });

  // --- Resend OTP ---
  window.Resend = function () {
    resendBtn.disabled = true;

    $.ajax({
      type: "POST",
      url: "/resend-Otp",
      data: { redirect: redirectPath }, // ✅ use 'redirect' for backend consistency
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "info",
            title: "OTP Resent Successfully",
            text: "Please check your email for the new OTP.",
            showConfirmButton: false,
            timer: 2000,
          });
          otpInputs.forEach((i) => (i.value = "")); // clear inputs
          otpInputs[0].focus();
          startTimer();
        } else {
          Swal.fire({
            icon: "Warring",
            title: "Warring",
            text: response.message || "Unable to resend OTP.",
          });
          resendBtn.disabled = false;
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("Resend OTP failed:", {
          status: jqXHR.status,
          statusText: jqXHR.statusText,
          responseText: jqXHR.responseText,
          responseJSON: jqXHR.responseJSON,
          textStatus,
          errorThrown,
        });

        const serverMsg =
          (jqXHR.responseJSON && jqXHR.responseJSON.message) ||
          (jqXHR.responseText && jqXHR.responseText) ||
          "Failed to resend OTP. Try again!";

        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: serverMsg,
        });

        resendBtn.disabled = false; // re-enable on error
      },
    });

    return false;
  };

  // --- Init ---
  startTimer();
  otpInputs[0].focus();
})();
