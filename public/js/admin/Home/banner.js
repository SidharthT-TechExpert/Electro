// ==================== Add Banner ====================
function addBannerModal() {
  Swal.fire({
    title: "➕ Add New Banner",
    width: "600px",
    html: `
      <div class="swal-scrollable p-2">
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Title</label>
          <input type="text" id="swal-input-title" class="form-control" placeholder="Enter banner title">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Banner Image</label>
          <div id="swal-image-container" class="image-upload-placeholder text-center border rounded p-3 cursor-pointer">
            <i class="fa fa-plus"></i> <span>Add</span>
            <input type="file" id="swal-input-image" style="display:none" accept="image/*">
          </div>
          <img id="swal-image-preview" style="width:100px; margin-top:5px; display:none;">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Button Link</label>
          <input type="text" id="swal-input-link" class="form-control" placeholder="Enter button link">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Start Date</label>
          <input type="date" id="swal-input-start" class="form-control">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">End Date</label>
          <input type="date" id="swal-input-end" class="form-control">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Status</label>
          <select id="swal-input-status" class="form-control">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Add Banner",
    didOpen: () => {
      const container = document.getElementById("swal-image-container");
      const fileInput = document.getElementById("swal-input-image");
      const preview = document.getElementById("swal-image-preview");

      container.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            preview.src = event.target.result;
            preview.style.display = "block";
          };
          reader.readAsDataURL(file);
        }
      });
    },
    preConfirm: () => {
      const title = document.getElementById("swal-input-title").value.trim();
      const fileInput = document.getElementById("swal-input-image");
      const file = fileInput.files[0];
      const buttonLink = document
        .getElementById("swal-input-link")
        .value.trim();
      const startDate = document.getElementById("swal-input-start").value;
      const endDate = document.getElementById("swal-input-end").value;
      const isActive = document.getElementById("swal-input-status").value;

      if (!title || !file || !startDate || !endDate) {
        Swal.showValidationMessage(
          "⚠️ Title, Image, Start Date, and End Date are required!"
        );
        return false;
      }

      return { title, file, buttonLink, startDate, endDate, isActive };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append("title", result.value.title);
      formData.append("image", result.value.file);
      formData.append("buttonLink", result.value.buttonLink);
      formData.append("startDate", result.value.startDate);
      formData.append("endDate", result.value.endDate);
      formData.append("isActive", result.value.isActive);

      $.ajax({
        type: "POST",
        url: "/admin/banner",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Banner Added Successfully",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => location.reload());
          } else {
            Swal.fire("Error", response.message, "error");
          }
        },
      });
    }
  });
}

// ==================== Edit Banner ====================
function editBanner(id) {
  const banner = window.bannerData.find((b) => b._id === id);
  if (!banner) return Swal.fire("Error", "Banner not found", "error");

  Swal.fire({
    title: "✏️ Edit Banner",
    width: "600px",
    html: `
      <div class="swal-scrollable p-2">
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Title</label>
          <input type="text" id="swal-input-title" class="form-control" value="${
            banner.title
          }">
        </div>
         <div class="mb-3 text-start">
          <label class="form-label fw-bold">Order</label>
          <input type="text" inputmode="numeric" pattern="[0-9]*" class="form-control" id="swal-input-order" value="${
            banner.order
          }">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Banner Image</label>
          <div id="swal-image-container" class="image-upload-placeholder text-center border rounded p-3 cursor-pointer">
            <i class="fa fa-plus"></i> <span>Change</span>
            <input type="file" id="swal-input-image" style="display:none" accept="image/*">
          </div>
          <img id="swal-image-preview" style="width:100px; margin-top:5px;" src="${
            banner.image
          }">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Button Link</label>
          <input type="text" id="swal-input-link" class="form-control" value="${
            banner.buttonLink || ""
          }">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Start Date</label>
          <input type="date" id="swal-input-start" class="form-control" value="${
            new Date(banner.startDate).toISOString().split("T")[0]
          }">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">End Date</label>
          <input type="date" id="swal-input-end" class="form-control" value="${
            new Date(banner.endDate).toISOString().split("T")[0]
          }">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Status</label>
          <select id="swal-input-status" class="form-control">
            <option value="true" ${
              banner.isActive ? "selected" : ""
            }>Active</option>
            <option value="false" ${
              !banner.isActive ? "selected" : ""
            }>Inactive</option>
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Save Changes",
    didOpen: () => {
      const container = document.getElementById("swal-image-container");
      const fileInput = document.getElementById("swal-input-image");
      const preview = document.getElementById("swal-image-preview");
      const orderInput = document.getElementById("swal-input-order");

      container.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            preview.src = event.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      orderInput.addEventListener("input", () => {
        $.ajax({
          type: "POST",
          url: "/admin/banner/check-order",
          data: { order: orderInput.value, id },
          success: function (response) {
            if (!response.success) {
              Swal.showValidationMessage(`❌ ${response.message}`);
              return false;
            }
            Swal.resetValidationMessage();
          },
          error: function () {
            Swal.showValidationMessage("❌ Error validating order!");
          },
        });
      });
    },

    preConfirm: () => {
      const title = document.getElementById("swal-input-title").value.trim();
      const fileInput = document.getElementById("swal-input-image");
      const file = fileInput.files[0];
      const buttonLink = document
        .getElementById("swal-input-link")
        .value.trim();
      const startDate = document.getElementById("swal-input-start").value;
      const endDate = document.getElementById("swal-input-end").value;
      const isActive =
        document.getElementById("swal-input-status").value === "true";
      const order = document.getElementById("swal-input-order").value;

      if (
        !title ||
        (!file && !banner.image) ||
        !startDate ||
        !endDate ||
        !order
      ) {
        Swal.showValidationMessage(
          "⚠️ Title, Order , Image, Start Date, and End Date are required!"
        );
        return false;
      }

      $.ajax({
        type: "POST",
        url: "/admin/banner/check-Date",
        data: { startDate, endDate },
        async: false,
        success: function (response) {
          if (!response.valid) {
            Swal.showValidationMessage(`❌ ${response.message}`);
            return false;
          }
          Swal.resetValidationMessage();
        },
        error: function () {
          Swal.showValidationMessage("❌ Error validating dates!");
          return false;
        },
      });

      return {
        id,
        title,
        order,
        file,
        buttonLink,
        startDate,
        endDate,
        isActive,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append("id", result.value.id);
      formData.append("title", result.value.title);
      if (result.value.file) formData.append("image", result.value.file);
      formData.append("buttonLink", result.value.buttonLink);
      formData.append("startDate", result.value.startDate);
      formData.append("endDate", result.value.endDate);
      formData.append("isActive", result.value.isActive);
      formData.append("order", result.value.order);

      $.ajax({
        type: "PUT",
        url: "/admin/banner",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Banner Updated Successfully",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => location.reload());
          } else {
            Swal.fire("Error", response.message, "error");
          }
        },
      });
    }
  });
}

// ==================== Delete Banner ====================
function deleteBanner(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This action will permanently delete the banner.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "DELETE",
        url: "/admin/banner",
        data: { id },
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Banner Deleted Successfully",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => location.reload());
          } else {
            Swal.fire("Error", response.message, "error");
          }
        },
      });
    }
  });
}
