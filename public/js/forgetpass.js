(function () {
  const step1 = document.getElementById("step-1"),
    step2 = document.getElementById("step-2"),
    step3 = document.getElementById("step-3"),
    toStep2Btn = document.getElementById("toStep2"),
    verifyOtpBtn = document.getElementById("verifyOtpBtn"),
    resetBtn = document.getElementById("resetBtn"),
    resendBtn = document.getElementById("resendBtn"),
    otpInputs = [...document.querySelectorAll(".rc-otp")],
    otpError = document.getElementById("otpError"),
    passError = document.getElementById("passError"),
    timerFill = document.getElementById("timerFill"),
    timerText = document.getElementById("timerText");

  const DEMO_OTP = "123456";
  let timer = null,
    DURATION = 30,
    remaining = DURATION;

  function showStep(n) {
    [step1, step2, step3].forEach((s) => s.classList.remove("active"));
    if (n === 1) step1.classList.add("active");
    if (n === 2) {
      step2.classList.add("active");
      otpInputs[0].focus();
      startTimer();
    }
    if (n === 3) step3.classList.add("active");
  }

  toStep2Btn.addEventListener("click", () => {
    const val = document.getElementById("identifier").value.trim();
    if (!val) return;
    showStep(2);
  });

  otpInputs.forEach((input, i) => {
    input.addEventListener("input", (e) => {
      const v = e.target.value.replace(/[^0-9]/g, "");
      e.target.value = v;
      if (v && i < otpInputs.length - 1) otpInputs[i + 1].focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && i > 0)
        otpInputs[i - 1].focus();
    });
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const d = (e.clipboardData.getData("text") || "")
        .replace(/\D/g, "")
        .split("");
      d.forEach((c, j) => {
        if (otpInputs[j]) otpInputs[j].value = c;
      });
      otpInputs[Math.min(d.length - 1, otpInputs.length - 1)].focus();
    });
  });

  verifyOtpBtn.addEventListener("click", () => {
    const otp = otpInputs.map((i) => i.value).join("");
    if (otp !== DEMO_OTP) {
      otpError.style.display = "block";
      otpInputs.forEach((i) => (i.value = ""));
      otpInputs[0].focus();
      return;
    }
    otpError.style.display = "none";
    clearInterval(timer);
    showStep(3);
  });

  resendBtn.addEventListener("click", (e) => {
    e.preventDefault();
    otpInputs.forEach((i) => (i.value = ""));
    otpInputs[0].focus();
    startTimer();
  });

  function startTimer() {
    clearInterval(timer);
    remaining = DURATION;
    timerFill.style.width = "100%";
    timerText.textContent = `⏳ ${remaining}s`;
    timer = setInterval(() => {
      remaining--;
      timerFill.style.width = (remaining / DURATION) * 100 + "%";
      timerText.textContent =
        remaining > 0 ? `⏳ ${remaining}s` : "Resend available";
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
  }

  // Password strength
  const newPass=document.getElementById('newPass'),
        meter=document.getElementById('strengthMeter'),
        label=document.getElementById('strengthLabel');
  newPass.addEventListener('input',()=>{
    const v=newPass.value;
    let s=0; if(v.length>=6)s++; if(/[A-Z]/.test(v))s++; if(/[0-9]/.test(v))s++; if(/[^A-Za-z0-9]/.test(v))s++;
    const w=[0,25,50,75,100], c=['#ff3d3d','#ff8a3d','#ffd54d','#9be26b','#4cd964'], t=['Too short','Weak','Okay','Good','Strong'];
    meter.style.width=w[s]+"%"; meter.style.background=c[s]; label.textContent=v?t[s]:"";
  });

  resetBtn.addEventListener('click',()=>{
    const a=document.getElementById('newPass').value, b=document.getElementById('confirmPass').value;
    if(!a||!b){passError.style.display="block"; passError.textContent="Fill both fields"; return;}
    if(a!==b){passError.style.display="block"; passError.textContent="❌ Passwords do not match."; return;}
    passError.style.display="none"; alert("✅ Password updated (demo). Redirecting...");
  });

  showStep(1);

})();
