// Helper Get element ID
const $ = (id) => document.getElementById(id);

// Toggle password
document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", () => {
    const targetId = icon.getAttribute("data-target");
    const input = $(targetId);

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

//Get Element By ID's
const nameId = $("name");
const email = $("email");
const phone = $("phone");
const password = $("password");
const cPassword = $("confirmPassword");
const signupForm = $("signupForm");

//Error id's
const nameError = $("nameError");
const emailError = $("emailError");
const phoneError = $("phoneError");
const passwordError = $("passwordError");
const cPasswordError = $("cPasswordError");

const nameValidactionChecking = (e) => {
  const name = nameId.value.trim() ;
  //name pattern
  const namePattern = /^[A-Za-z\s]+$/

  if(name === ''){
    nameError.style.display = 'inline-block';
    nameError.innerHTML='Please Enter a valid name!'
  }else if(!namePattern.test(name)){
    nameError.style.display = 'inline-block';
    nameError.innerHTML='Name only contain alphabets & spaces!'
  }else {
    nameError.style.display = 'none';
    nameError.innerHTML='';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  signupForm.addEventListener("submit", (e) => {
    nameValidactionChecking();
    emailValidactionChecking();
    phoneValidactionChecking();
    phoneValidactionChecking();
    passwordValidactionChecking();

    if (
      !nameId ||
      !email ||
      !phone ||
      !password ||
      !cPassword ||
      !nameError ||
      !emailError ||
      !phoneError ||
      !passwordError ||
      !cPasswordError
    ) {
      console.error("One or more elements not found ");
    }

    if (
      !nameError.innerHTML ||
      !emailError.innerHTML ||
      !phoneError.innerHTML ||
      !passwordError.innerHTML ||
      !cPasswordError.innerHTML
    ) {
      e.preventDefault();
    }
  });
});
