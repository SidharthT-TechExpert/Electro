const toggleBtn = document.getElementById("toggleLogin");
const formContainer = document.getElementById("formContainer");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const googleBtnText = document.getElementById("googleBtnText");

toggleBtn.addEventListener("click", () => {
  formContainer.classList.toggle("login-mode");

  if (formContainer.classList.contains("login-mode")) {
    formTitle.textContent = "Login";
    submitBtn.textContent = "Login";
    googleBtnText.textContent = "Login with Google";
    toggleBtn.textContent = "Don't have an account? Sign Up";
  } else {
    formTitle.textContent = "Create an Account";
    submitBtn.textContent = "Create Account";
    googleBtnText.textContent = "Sign up with Google";
    toggleBtn.textContent = "Already have an account? Log In";
  }
});
