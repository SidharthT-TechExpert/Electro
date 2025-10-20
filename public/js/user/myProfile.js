const deleteBtn = document.getElementById("deletePhotoBtn");

async function editName(currentName, userId) {
  if (!userId) return Swal.fire("❌ Error", "User ID missing", "error");

  // Ask for new name
  const { value: newName } = await Swal.fire({
    title: "Edit Name",
    input: "text",
    inputLabel: "Enter your new full name",
    inputValue: currentName || "",
    inputPlaceholder: "Full name",
    confirmButtonText: "Update Name",
    showCancelButton: true,
    inputValidator: (value) => {
      if (typeof value !== "string") return "Name is not a string!";

      const trimName = value.trim();

      if (trimName !== value) return "Name cannot start or end with a space.";
      if (!trimName) return "Name cannot be empty.";
      if (value.trim().length < 3) return "Name must be at least 3 characters.";

      const Pattern = /^(?=.{3,30}$)[A-Za-z]+(?: [A-Za-z]+)*$/;
      if (!Pattern.test(value))
        return "Name must be 3–30 characters and contain letters only, with single spaces in between words.";
    },
  });

  if (!newName) return; // user cancelled

  console.log(newName);

  try {
    // Send request to backend to update name
    const response = await fetch("/update-name", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), id: userId }),
    }).then((res) => res.json());

    if (response.success) {
      Swal.fire({
        icon: "success",
        title: "Name Updated!",
        text: response.message || "Your name has been successfully updated.",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => location.reload());
    } else {
      Swal.fire(
        "❌ Error",
        response.message || "Failed to update name.",
        "error"
      );
    }
  } catch (err) {
    console.error("Error updating name:", err);
    Swal.fire("⚠️ Error", "Something went wrong. Please try again.", "error");
  }
}

const passwordId = document.getElementById("password"),
  cPasswordId = document.getElementById("cPassword"),
  passwordErrorId = document.getElementById("passwordError"),
  cPasswordErrorId = document.getElementById("cPasswordError");

function validatePassword() {
  const passwordInput = passwordId.value;
  const password = passwordInput.trim();

  const lower = /[a-z]/,
    upper = /[A-Z]/,
    digit = /\d/,
    special = /[@$!%*?&]/,
    allowed = /^[A-Za-z\d@$!%*?&]+$/;

  // Check for leading/trailing spaces
  if (passwordInput !== password) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Password cannot contain spaces!";
    return false;
  }

  // No spaces
  if (password.includes(" ")) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Password cannot contain spaces!";
    return false;
  }
  // Only allowed characters
  else if (!allowed.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent =
      "❌ Password contains invalid characters! Only letters, numbers, and @$!%*?& are allowed.";
    return false;
  }
  // Minimum length
  else if (password.length < 8) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must be at least 8 characters!";
    return false;
  }
  // Lowercase check
  else if (!lower.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include a lowercase letter!";
    return false;
  }
  // Uppercase check
  else if (!upper.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include an uppercase letter!";
    return false;
  }
  // Digit check
  else if (!digit.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent = "❌ Must include a number!";
    return false;
  }
  // Special character check
  else if (!special.test(password)) {
    passwordErrorId.style.display = "inline-block";
    passwordErrorId.textContent =
      "❌ Must include a special character (@, $, !, %, *, ?, &)";
    return false;
  }

  // All validations passed
  passwordErrorId.style.display = "none";
  passwordErrorId.textContent = "";
  return true;
}

function validateCPassword() {
  const passwordId = document.getElementById("password").value.trim();
  const cpasswordId = document.getElementById("cpassword").value.trim();

  if (passwordId !== cpasswordId) {
    cPasswordErrorId.style.display = "inline-block";
    cPasswordErrorId.textContent = "Password do not match!";
    return false;
  }
  cPasswordErrorId.style.display = "none";
  cPasswordErrorId.textContent = "";
  return true;
}

function ChangePassword(f) {
  const currentPassword = f.currentPassword.value.trim();
  const newPassword = f.newPassword.value.trim();
  const confirmPassword = f.confirmPassword.value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill in all password fields.",
    });
    return false;
  }

  if (newPassword.length < 8) {
    Swal.fire({
      icon: "warning",
      title: "Weak Password",
      text: "Password must be at least 8 characters long.",
    });
    return false;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire({
      icon: "warning",
      title: "Password Mismatch",
      text: "New and confirm password do not match.",
    });
    return false;
  }

  fetch("/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Password Updated!",
          text: response.message || "Password changed successfully.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => location.reload());
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Unable to change password.",
        });
      }
    })
    .catch((err) => {
      console.error("Error changing password:", err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong. Please try again later.",
      });
    });

  return false;
}

function addPassword(f) {
  const newPassword = f.newPassword.value.trim();
  const confirmPassword = f.confirmPassword.value.trim();

  if (!newPassword || !confirmPassword) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill in all password fields.",
    });
    return false;
  }

  if (newPassword.length < 8) {
    Swal.fire({
      icon: "error",
      title: "Weak Password",
      text: "Password must be at least 8 characters long.",
    });
    return false;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Password Mismatch",
      text: "New password and confirmation do not match.",
    });
    return false;
  }

  fetch("/add-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword, confirmPassword }),
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Password Added!",
          text: response.message || "Password added successfully.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => location.reload());
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Unable to add password.",
        });
      }
    })
    .catch((err) => {
      console.error("Error adding password:", err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong. Please try again later.",
      });
    });

  return false;
}

async function editPhone(currentPhone) {
  // Ask for new phone number
  const { value: newPhone } = await Swal.fire({
    title: "Enter New Phone Number",
    input: "number",
    inputLabel: "We’ll send an OTP to this number",
    inputValue: currentPhone,
    inputPlaceholder: "Enter new phone number",
    confirmButtonText: "Send OTP",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!/^[0-9]{10}$/.test(value)) {
        return "Please enter a valid 10-digit phone number.";
      }
    },
  });

  if (!newPhone) return;

  // Step 2: Send OTP request
  const otpResponse = await fetch("/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: newPhone }),
  }).then((res) => res.json());

  if (!otpResponse.success) {
    return Swal.fire(
      "Error",
      otpResponse.message || "Failed to send OTP",
      "error"
    );
  } else {
    Swal.fire({
      icon: "success",
      text: otpResponse.message,
      timer: 1500,
    });
  }

  // Step 3: Ask user to enter OTP
  const { value: otp } = await Swal.fire({
    title: "Enter OTP",
    input: "text",
    inputPlaceholder: "Enter 6-digit OTP",
    confirmButtonText: "Verify OTP",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!/^[0-9]{6}$/.test(value)) {
        return "Please enter a valid 6-digit OTP.";
      }
    },
  });

  if (!otp) return;

  // Step 4: Verify OTP
  const verifyResponse = await fetch("/verifyOTP", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: newPhone, otp }),
  }).then((res) => res.json());

  if (verifyResponse.success) {
    Swal.fire({
      icon: "success",
      title: "Phone Updated!",
      text: "Your phone number has been successfully updated.",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => location.reload());
  } else {
    Swal.fire("Error", verifyResponse.message || "Invalid OTP", "error");
  }
}

async function editEmail(currentEmail, id) {
  const { value: newEmail } = await Swal.fire({
    title: "Enter New Email Address",
    input: "email",
    inputLabel: "We’ll send an OTP to this email",
    inputValue: currentEmail || "",
    inputPlaceholder: "Enter new email address",
    confirmButtonText: "Send OTP",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) return "Please enter an email address.";
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(value)) return "Please enter a valid and properly formatted email address (for example: johndoe@example.com)"
    },
  });

  if (!newEmail) return;

  try {
    // ✅Send OTP
    const response = await fetch("/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail, id }),
    }).then((res) => res.json());

    if (!response.success) {
      return Swal.fire(
        "❌ Error",
        response.message || "Failed to send OTP.",
        "error"
      );
    }

    await Swal.fire({
      icon: "success",
      text: `OTP has been sent to ${newEmail}`,
      timer: 1500,
      showConfirmButton: false,
    });

    // ✅ Enter OTP
    const { value: otp } = await Swal.fire({
      title: "Enter OTP",
      input: "text",
      inputPlaceholder: "Enter 6-digit OTP",
      confirmButtonText: "Verify OTP",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!/^[0-9]{6}$/.test(value)) {
          return "Please enter a valid 6-digit OTP.";
        }
      },
    });

    if (!otp) return;

    // ✅ Verify OTP
    const verifyResponse = await fetch("/verifyEmail_OTP", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp, email: newEmail }),
    }).then((res) => res.json());

    if (verifyResponse.success) {
      console.log(verifyResponse.success);
      Swal.fire({
        icon: "success",
        title: "Email Updated!",
        text: "Your email has been successfully updated.",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => location.reload());
    } else {
      Swal.fire("❌ Error", verifyResponse.message || "Invalid OTP.", "error");
    }
  } catch (error) {
    console.error("Error sending or verifying OTP:", error);
    Swal.fire("⚠️ Error", "Something went wrong. Please try again.", "error");
  }
}

const photoInput = document.getElementById("profilePhotoInput");

photoInput.addEventListener("click", async () => {
  let cropper;

  Swal.fire({
    title: "Upload & Crop Image",
    html: `
      <div id="imageUploader" style="
        max-width:400px; 
        margin:auto; 
        padding:20px; 
        border:2px dashed #1e90ff; 
        border-radius:12px; 
        text-align:center; 
        transition:0.3s; 
        cursor:pointer;">
        <p id="uploadText" style="margin:0; font-weight:bold; color:#1e90ff;">📁 Drag & Drop Image or Click to Upload</p>
        <input type="file" id="swalImageFile" accept="image/*" style="display:none;" />
      </div>

      <div id="previewContainer" style="margin-top:15px; display:none; text-align:center;">
        <img id="previewImage" style="
          width:200px; 
          height:200px; 
          object-fit:cover; 
          border-radius:50%; 
          box-shadow:0 6px 15px rgba(0,0,0,0.2);" />
        <div style="margin-top:10px;">
          <button id="removeImage" style="
            padding:6px 14px; 
            border:none; 
            background:#ff4d4f; 
            color:white; 
            border-radius:8px; 
            cursor:pointer; 
            transition:0.2s;">
            ❌ Remove
          </button>
        </div>
        <p id="fileInfo" style="margin-top:5px; font-size:0.9rem; color:#555;"></p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Upload",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      const uploader = document.getElementById("imageUploader");
      const fileInput = document.getElementById("swalImageFile");
      const previewContainer = document.getElementById("previewContainer");
      const previewImage = document.getElementById("previewImage");
      const removeButton = document.getElementById("removeImage");
      const fileInfo = document.getElementById("fileInfo");

      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

      uploader.addEventListener("click", () => fileInput.click());

      uploader.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploader.style.borderColor = "#00bfff";
        uploader.style.background = "#f0f8ff";
      });

      uploader.addEventListener("dragleave", (e) => {
        e.preventDefault();
        uploader.style.borderColor = "#1e90ff";
        uploader.style.background = "transparent";
      });

      uploader.addEventListener("drop", (e) => {
        e.preventDefault();
        uploader.style.borderColor = "#1e90ff";
        uploader.style.background = "transparent";
        fileInput.files = e.dataTransfer.files;
        handleFile();
      });

      fileInput.addEventListener("change", handleFile);

      function handleFile() {
        const file = fileInput.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          Swal.fire({
            icon: "error",
            title: "Invalid File",
            text: "Please upload a valid image file.",
            showConfirmButton: true,
          });
          fileInput.value = "";
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          Swal.fire({
            icon: "error",
            title: "File Too Large",
            text: "Image must be less than 2MB.",
            showConfirmButton: true,
          });
          fileInput.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
          previewContainer.style.display = "block";
          fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(
            1
          )} KB)`;

          // Initialize Cropper
          if (cropper) cropper.destroy();
          cropper = new Cropper(previewImage, {
            aspectRatio: 1,
            viewMode: 1,
            background: false,
            movable: true,
            zoomable: true,
            rotatable: false,
            scalable: false,
            guides: true,
            dragMode: "move",
          });
        };
        reader.readAsDataURL(file);
      }

      removeButton.addEventListener("click", () => {
        fileInput.value = "";
        previewImage.src = "";
        previewContainer.style.display = "none";
        if (cropper) cropper.destroy();
        cropper = null;
      });
    },
    willClose: () => {
      if (cropper) cropper.destroy();
      cropper = null;
    },
    preConfirm: () => {
      if (!cropper) {
        Swal.showValidationMessage("Please select and crop an image!");
        return false;
      }

      return new Promise((resolve, reject) => {
        cropper.getCroppedCanvas().toBlob(async (blob) => {
          try {
            const formData = new FormData();
            formData.append("profilePhoto", blob, "profile.jpg");

            const res = await fetch("/upload-profile-photo", {
              method: "POST",
              body: formData,
            });
            const json = await res.json();

            if (json.success) resolve(json);
            else reject(json.message);
          } catch (err) {
            reject(err.message);
          }
        }, "image/jpeg");
      });
    },
  }).then((result) => {
    if (result.isConfirmed) {
      if (result.value.success) {
        Swal.fire({
          icon: "success",
          title: "Profile Photo Updated!",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => location.reload());
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed!",
          text: result.value.message + ", Try again!",
          showConfirmButton: true,
        });
      }
    }
  });
});

const previewBtn = document.getElementById("profilePreview");
const box = document.getElementById("previewBox");

previewBtn.addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent immediate close
  const rect = previewBtn.getBoundingClientRect();

  if (box.style.display === "none" || box.style.display === "") {
    box.innerHTML = `
        <img src="${profilePhoto}"
          alt="Profile Photo Preview"
          style="width:100%;height:100%;object-fit:cover;border-radius:10px;">
      `;

    // Position the box centered over the preview button
    box.style.left = `${rect.left + rect.width / 2 - 125}px`;
    box.style.top = `${rect.top + window.scrollY + rect.height / 2 - 125}px`;

    box.style.display = "flex";
  } else {
    box.style.display = "none";
  }
});

// Close when clicking anywhere outside
document.addEventListener("click", (event) => {
  const isClickInsideBox = box.contains(event.target);
  const isClickOnButton = event.target === previewBtn;
  if (!isClickInsideBox && !isClickOnButton) {
    box.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const passwordId = document.getElementById("password");
  const cpasswordId = document.getElementById("cpassword");

  if (passwordId) {
    passwordId.addEventListener("input", validatePassword);
  }
  if (cpasswordId) {
    cpasswordId.addEventListener("input", validateCPassword);
  }
});
