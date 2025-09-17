  /* Active Block Modal */      
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".toggle-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const currentStatus = this.dataset.status;
        const isListed = (currentStatus || "").toLowerCase() === "active";
        const newStatus = isListed ? "blocked" : "active";

        Swal.fire({
          icon: "warning",
          title: "Are you sure?",
          text: isListed
            ? "This will block the brand. It will no longer be visible to users."
            : "This will activate the brand. It will be visible to users.",
          showCancelButton: true,
          confirmButtonText: isListed ? "Yes, Block!" : "Yes, Activate!",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              type: "PATCH",
              url: `/admin/brands`,
              data: { status: newStatus , id },
              success: function (response) {
                if (response.success) {
                  Swal.fire({
                    icon: "success",
                    title: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                  });

                  // ✅ Update badge
                  const badgeCell = document.querySelector(`.status-badge-${id}`);
                  badgeCell.innerHTML =
                    response.status.toLowerCase() === "active"
                      ? '<span class="badge bg-success">active</span>'
                      : '<span class="badge bg-danger">blocked</span>';

                  // ✅ Update button
                  btn.dataset.status = response.status;
                  btn.setAttribute(
                    "title",
                    response.status.toLowerCase() === "active"
                      ? "block Brand"
                      : "active Brand"
                  );
                  btn.innerHTML =
                    response.status.toLowerCase() === "active"
                      ? '<i class="fa fa-eye-slash"></i>'
                      : '<i class="fa fa-eye"></i>';
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
                  title: "Server Error",
                  text: "Please try again!",
                });
              },
            });
          }
        });
      });
    });
  });

  /* Add Brand Modal */
  function addBrandModal() {
    Swal.fire({
      title: "➕ Add New Brand",
      html: `
        <div class="mb-3 text-start">
          <label for="swal-input-name" class="form-label fw-bold">Brand Name</label>
          <input type="text" id="swal-input-name" class="form-control" placeholder="Enter brand name">
        </div>
        <div class="mb-3 text-start">
          <label for="swal-input-logo" class="form-label fw-bold">Brand Logo</label>
          <input type="file" id="swal-input-logo" class="form-control" accept="image/*">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add Brand",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-wide",
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-secondary me-2"
      },
      buttonsStyling: false,
      preConfirm: () => {
        const name = document.getElementById("swal-input-name").value.trim();
        const file = document.getElementById("swal-input-logo").files[0];

        if (!name) {
          Swal.showValidationMessage("⚠️ Brand name is required!");
          return false;
        }
        if (!file) {
          Swal.showValidationMessage("⚠️ Brand logo is required!");
          return false;
        }

        return { name, file };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { name, file } = result.value;

        const formData = new FormData();
        formData.append("name", name);
        formData.append("logo", file);

        $.ajax({
          type: "POST",
          url: "/admin/brands",
          data: formData,
          processData: false,
          contentType: false,
          success: function (response) {
            if (response.success) {
              Swal.fire({
                icon: "success",
                title: "Brand Added!",
                text: response.message,
                timer: 1500,
                showConfirmButton: false,
              }).then(() => location.reload());
            }  else {
              Swal.fire("Error", response.message, "error");
            }
          },
          error: function (xhr) {
            let msg = "Something went wrong!";
           if (xhr.responseJSON && xhr.responseJSON.message) {
             msg = xhr.responseJSON.message; // ✅ get backend message
           }
           Swal.fire("Error", msg, "error");
         },
        });
      }
    });
  }
  /* Delete Brand Modal */
  function deleteBrand(id) {
          Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the Brand.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!"
          }).then((result) => {
            if (result.isConfirmed) {
              $.ajax({
                type: "DELETE",
                url: `/admin/brands`,
                data:{id},
                success: function (response) {
                  if (response.success) {
                    Swal.fire({
                      icon: "success",
                      title: response.message,
                      showConfirmButton: false,
                      timer: 1500
                    });
                    // ✅ remove row from table instantly
                    document.querySelector(`a[onclick="deleteBrand('${id}')"]`)
                      .closest("tr")
                      .remove();
                  } else {
                    Swal.fire("Error", response.message, "error");
                  }
                },
                error: function () {
                  Swal.fire({
                    icon: "error",
                    title: "Server Error",
                    text: "Please try again later!",
                  });
                },
              });
            }
          });
        }
  /* Edit Brand Modal */
  function editBrand(id) {
  // ✅ Get latest values from DOM row
  const row = document.querySelector(`a[onclick*="${id}"]`).closest("tr");
  const currentName = row.querySelector(".brand-name").innerText;
  const currentLogo = row.querySelector(".brand-logo").src;

  Swal.fire({
    title: `<h2 style="font-weight:700; font-size:22px; color:#1e293b; display:flex; align-items:center; gap:8px;">
      <i class="fas fa-edit" style="color:#6366f1;"></i> Edit Brand
    </h2>`,
    html: `
      <div class="mb-3 text-start">
        <label for="swal-edit-name" class="form-label fw-bold">Brand Name</label>
        <input type="text" id="swal-edit-name" class="form-control" 
               placeholder="Enter brand name" value="${currentName}">
      </div>
      <div class="mb-3 text-start">
        <label for="swal-edit-logo" class="form-label fw-bold">Brand Logo</label>
        <input type="file" id="swal-edit-logo" class="form-control" accept="image/*">
        <div class="mt-2">
          <img src="${currentLogo}" alt="${currentName} Logo" 
               style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:1px solid #ccc;" />
          <small class="text-muted d-block">Leave empty if you don’t want to change the logo.</small>
        </div>
      </div>
    `,
    focusConfirm: false,
    width: "480px",
    background: "#f9fafb",
    padding: "1.8rem",
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-save"></i> Update Brand',
    cancelButtonText: '<i class="fas fa-times"></i> Cancel',
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#6b7280",
    customClass: {
      popup: "swal2-rounded",
      confirmButton: "btn btn-primary",
      cancelButton: "btn btn-secondary"
    },
    preConfirm: () => {
      const name = document.getElementById("swal-edit-name").value.trim();
      const file = document.getElementById("swal-edit-logo").files[0];

      if (!name) {
        Swal.showValidationMessage("⚠️ Brand name is required!");
        return false;
      }

      return { name, file };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { name, file } = result.value;

      const formData = new FormData();
      formData.append("name", name);
      if (file) {
        formData.append("logo", file);
      }

      $.ajax({
        type: "PATCH",
        url: `/admin/brands/${id}`,
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.success) {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Brand updated successfully!",
              showConfirmButton: false,
              timer: 2000
            });

            // ✅ Update DOM with new values
            row.querySelector(".brand-name").innerText = response.brand.name;
            if (response.brand.logo) {
              row.querySelector(".brand-logo").src = response.brand.logo;
            }
          } else {
            Swal.fire("Error", response.message, "error");
          }
        },
        error: function (xhr) {
          let msg = "Server error, please try again!";
          if (xhr.responseJSON && xhr.responseJSON.message) {
            msg = xhr.responseJSON.message;
          }
          Swal.fire("Error", msg, "error");
        }
      });
    }
  });
}
