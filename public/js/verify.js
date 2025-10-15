
(function () {
  const otpInputs = [...document.querySelectorAll(".rc-otp")],
    otpError = document.getElementById("otpError"),
    timerFill = document.getElementById("timerFill"),
    timerText = document.getElementById("timerText"),
    resendBtn = document.getElementById("resendBtn"),
    submitBtn = document.getElementById("verifyOtpBtn");
    redirectPath = document.getElementById("redirectInput").value;

  let timer = null,
    DURATION = 30, // ⏳ change duration if needed
    remaining = DURATION;

  // --- Verify OTP AJAX ---
  function verifyOTP() {
    const otp = otpInputs.map((i) => i.value).join("");
    if (otp.length < 6) return; // require full 6 digits
    otpError.style.display = "none";

    $.ajax({
      type: "POST",
      url: "/verify-Otp",
      data: { otp , redirect : redirectPath },
      success: function (response) {
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "OTP Verified Successfully",
            showConfirmButton: false,
            timer: 1500,
          }).then(async() => {
            console.log(response.redirectUrl)
 await new Promise(resolve => setTimeout(resolve,5000))
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
      error: function (jqXHR, textStatus, errorThrown) {
        // show nicer message but also log details for debugging
        console.error(" OTP Verification failed:", {
          status: jqXHR.status,
          statusText: jqXHR.statusText,
          responseText: jqXHR.responseText,
          responseJSON: jqXHR.responseJSON,
          textStatus,
          errorThrown,
        });

        // try to surface any server-sent message
        const serverMsg =
          (jqXHR.responseJSON && jqXHR.responseJSON.message) ||
          (jqXHR.responseText && jqXHR.responseText) ||
          "Failed to OTP Verification . Try again!";

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

  // --- Submit button click ---
  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    verifyOTP();
  });

  // --- Resend ---
  
  window.Resend = function () {
    $.ajax({
      type: "POST",
      url: "/resend-Otp",
      data: { redirectPath },
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
            icon: "error",
            title: "Error",
            text: response.message,
          });
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // show nicer message but also log details for debugging
        console.error("Resend OTP failed:", {
          status: jqXHR.status,
          statusText: jqXHR.statusText,
          responseText: jqXHR.responseText,
          responseJSON: jqXHR.responseJSON,
          textStatus,
          errorThrown,
        });

        // try to surface any server-sent message
        const serverMsg =
          (jqXHR.responseJSON && jqXHR.responseJSON.message) ||
          (jqXHR.responseText && jqXHR.responseText) ||
          "Failed to resend OTP. Try again!";

        Swal.fire({
          icon: "error",
          title: "Server Error",
          text: serverMsg,
        });
      },
    });
    return false;
  };

  // --- Init ---
  startTimer();
  otpInputs[0].focus();
})();
