document.addEventListener("DOMContentLoaded", () => {
  const userBtn = document.querySelector(".user-btn");
  const arrowIcon = document.querySelector(".arrow-icon");

  if (userBtn && arrowIcon) {
    // Bootstrap dropdown events
    userBtn.addEventListener("show.bs.dropdown", () => {
      arrowIcon.style.transform = "rotate(180deg)";
    });
    userBtn.addEventListener("hide.bs.dropdown", () => {
      arrowIcon.style.transform = "rotate(0deg)";
    });
  }
});
