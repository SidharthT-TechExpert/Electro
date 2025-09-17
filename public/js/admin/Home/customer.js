const Blocked = (id, isBlocked) => {
  Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: isBlocked
      ? "This will unblock the user. They will regain access."
      : "This will block the user. They will no longer be able to access the system.",
    showCancelButton: true,
    confirmButtonText: isBlocked ? "Yes, Unblock!" : "Yes, Block!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "PATCH",
        url: `/admin/customersBlock?_id=${id}&isBlocked=${!isBlocked}`,
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: response.message,
              showConfirmButton: false,
              timer: 1500,
            });

            // ✅ Update the button dynamically
            const btn = document.querySelector(`button[data-id="${id}"]`);
            const badgeContainer = document.querySelector(`.status-badge-${id}`);

            if (response.isBlocked) {
              // User is now BLOCKED
              btn.className = "btn-success";
              btn.innerHTML = '<i class="fas fa-unlock"></i> Unblock';
              btn.setAttribute("onclick", `Blocked('${id}', true)`);
              badgeContainer.innerHTML = `<span class="badge bg-danger">Blocked</span>`;
            } else {
              // User is now ACTIVE
              btn.className = "btn-danger";
              btn.innerHTML = '<i class="fas fa-ban"></i> Block';
              btn.setAttribute("onclick", `Blocked('${id}', false)`);
              badgeContainer.innerHTML = `<span class="badge bg-success">Active</span>`;
            }
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
};
