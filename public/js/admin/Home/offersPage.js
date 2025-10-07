function addOfferModal() {
  Swal.fire({
    title: "➕ Add New Offer",
    html: `
      <div class="swal-scrollable p-2">
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Offer Name</label>
          <input type="text" id="swal-input-name" class="form-control" placeholder="Enter offer name">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Offer Code</label>
          <input type="text" id="swal-input-code" class="form-control" placeholder="Enter offer code">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Discount Type</label>
          <select id="swal-input-type" class="form-control">
            <option value="Percentage" selected>Percentage</option>
            <option value="Fixed">Fixed</option>
          </select>
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Discount Value</label>
          <input type="number" id="swal-input-value" class="form-control" placeholder="Enter discount value">
        </div>

        <!-- Dynamic Max Amount field -->
        <div class="mb-3 text-start d-none" id="maxAmountContainer">
          <label class="form-label fw-bold">Max Discount Amount</label>
          <input type="number" id="swal-input-max" class="form-control" placeholder="Enter maximum discount amount">
        </div>

        <div class="mb-3 text-start">
          <label for="appliesTo" class="form-label fw-bold">Applies To</label>
          <select class="form-control" id="appliesTo" required>
            <option value="product">Product</option>
            <option value="category">Category</option>
          </select>
        </div>
        <div class="mb-3 text-start">
          <label for="targetIds" class="form-label fw-bold">Select Targets</label>
          <select class="form-control" id="targetIds" multiple required>
            ${products
              .map((p) => `<option value="${p._id}">${p.name}</option>`)
              .join("")}
          </select>
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
            <option value="false">Expired</option>
            <option value="true">Upcoming</option>
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Add Offer",
    didOpen: () => {
      const appliesToSelect = document.getElementById("appliesTo");
      const targetSelect = document.getElementById("targetIds");
      const discountTypeSelect = document.getElementById("swal-input-type");
      const maxAmountContainer = document.getElementById("maxAmountContainer");

      // ✅ Function to toggle max discount visibility
      function toggleMaxAmountField() {
        if (discountTypeSelect.value === "Percentage") {
          maxAmountContainer.classList.remove("d-none");
        } else {
          maxAmountContainer.classList.add("d-none");
          document.getElementById("swal-input-max").value = "";
        }
      }

      // ✅ Call once on open to handle default state
      toggleMaxAmountField();

      // ✅ Also handle changes dynamically
      discountTypeSelect.addEventListener("change", toggleMaxAmountField);

      appliesToSelect.addEventListener("change", function () {
        const items = this.value === "product" ? products : categories;
        targetSelect.innerHTML = "";
        items.forEach((item) => {
          const option = document.createElement("option");
          option.value = item._id;
          option.text = item.name;
          targetSelect.appendChild(option);
        });
      });
    },
    preConfirm: () => {
      const targetSelect = document.getElementById("targetIds");
      const selectedTargetIds = Array.from(targetSelect.selectedOptions).map(
        (o) => o.value
      );

      const name = document.getElementById("swal-input-name").value.trim();
      const code = document.getElementById("swal-input-code").value.trim();
      const discountType = document.getElementById("swal-input-type").value;
      const discountValue = document.getElementById("swal-input-value").value;
      const maxAmount = document.getElementById("swal-input-max").value;
      const appliesTo = document.getElementById("appliesTo").value;
      const startDate = document.getElementById("swal-input-start").value;
      const endDate = document.getElementById("swal-input-end").value;
      const status = document.getElementById("swal-input-status").value;

      if (selectedTargetIds.length === 0) {
        Swal.showValidationMessage("⚠️ Targets is required!");
        return false;
      }

      if (
        !name ||
        !code ||
        !discountType ||
        !appliesTo ||
        !discountValue ||
        !startDate ||
        !endDate
      ) {
        Swal.showValidationMessage("⚠️ All fields are required!");
        return false;
      }

      if (discountType === "Percentage" && !maxAmount) {
        Swal.showValidationMessage(
          "⚠️ Max Discount Amount is required for Percentage type!"
        );
        return false;
      }

      $.ajax({
        url: "/admin/offers/check-code",
        method: "POST",
        data: { code },
        async: false,
        success: function (response) {
          if (response.isUnique) {
            Swal.showValidationMessage("⚠️ Offer code must be unique!");
            return false;
          }
        },
      });

      $.ajax({
        url: "/admin/offers/check-Date",
        method: "POST",
        data: { startDate, endDate },
        async: false,
        success: function (response) {
          if (!response.valid) {
            Swal.showValidationMessage(`⚠️ ${response.message}`);
            return false;
          }
        },
      });

      $.ajax({
        url: "/admin/offers/check-discount",
        method: "POST",
        data: { discountType, discountValue, maxAmount },
        async: false,
        success: function (response) {
          if (!response.valid) {
            Swal.showValidationMessage(`⚠️ ${response.message}`);
            return false;
          }
        },
      });

      return {
        name,
        code,
        discountType,
        discountValue,
        maxAmount,
        appliesTo,
        targetIds: selectedTargetIds,
        startDate,
        endDate,
        isActive: status === "true",
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "POST",
        url: "/admin/offers",
        contentType: "application/json",
        data: JSON.stringify(result.value),
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Offer Added Successfully",
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

function editOffer(id) {
  const offer = window.offerData.find((o) => o._id === id);
  
  if (!offer) {
    Swal.fire("Error", "Offer not found", "error");
    return;
    F;
  }

  Swal.fire({
    title: "✏️ Edit Offer",
    html: `
      <div class="swal-scrollable p-2">
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Offer Name</label>
          <input type="text" id="swal-input-name" class="form-control" value="${
            offer.name
          }">
        </div>  
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Offer Code</label>
          <input type="text" id="swal-input-code" class="form-control" value="${
            offer.code
          }">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Discount Type</label>
          <select id="swal-input-type" class="form-control">
            <option value="Percentage" ${
              offer.discountType === "Percentage" ? "selected" : ""
            }>Percentage</option>
            <option value="Fixed" ${
              offer.discountType === "Fixed" ? "selected" : ""
            }>Fixed</option>
          </select>
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Discount Value</label>
          <input type="number" id="swal-input-value" class="form-control"
            value="${offer.discountValue}">
        </div>
        <!-- Dynamic Max Amount field -->
        <div class="mb-3 text-start ${
          offer.discountType === "Percentage" ? "" : "d-none"
        }" id="maxAmountContainer">
          <label class="form-label fw-bold">Max Discount Amount</label>
          <input type="number" id="swal-input-max" class="form-control" value="${
            offer.maxAmount || ""
          }" placeholder="Enter maximum discount amount">
        </div>
        <div class="mb-3 text-start">
          <label for="appliesTo" class="form-label fw-bold">Applies To</label>
          <select class="form-control" id="appliesTo" required>
            <option value="product" ${
              offer.appliesTo === "product" ? "selected" : ""
            }>Product</option>
            <option value="category" ${
              offer.appliesTo === "category" ? "selected" : ""
            }>Category</option>
          </select>
        </div>
        <div class="mb-3 text-start">
          <label for="targetIds" class="form-label fw-bold">Select Targets</label>
          <select class="form-control" id="targetIds" multiple required>
            ${products
              .map(
                (p) =>
                  `<option value="${p._id}" ${
                    offer.targetIds.includes(p._id) ? "selected" : ""
                  }>${p.name}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Start Date</label>
          <input type="date" id="swal-input-start" class="form-control"
            value="${new Date(offer.startDate).toISOString().split("T")[0]}">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">End Date</label>
          <input type="date" id="swal-input-end" class="form-control"
            value="${new Date(offer.endDate).toISOString().split("T")[0]}">
        </div>
        <div class="mb-3 text-start">
          <label class="form-label fw-bold">Status</label>
          <select id="swal-input-status" class="form-control">
            <option value="true" ${
              offer.isActive ? "selected" : ""
            }>Active</option>
            <option value="false" ${
              !offer.isActive ? "selected" : ""
            }>Expired</option>
            <option value="true">Upcoming</option>
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Save Changes",
    didOpen: () => {
      const appliesToSelect = document.getElementById("appliesTo");
      const targetSelect = document.getElementById("targetIds");
      const discountTypeSelect = document.getElementById("swal-input-type");
      const maxAmountContainer = document.getElementById("maxAmountContainer");

      // ✅ Function to toggle max discount visibility
      function toggleMaxAmountField() {
        if (discountTypeSelect.value === "Percentage") {
          maxAmountContainer.classList.remove("d-none");
        } else {
          maxAmountContainer.classList.add("d-none");
          document.getElementById("swal-input-max").value = "";
        }
      }

      // ✅ Call once on open to handle default state
      toggleMaxAmountField();

      // ✅ Also handle changes dynamically
      discountTypeSelect.addEventListener("change", toggleMaxAmountField);

      appliesToSelect.addEventListener("change", function () {
        const items = this.value === "product" ? products : categories;
        targetSelect.innerHTML = "";
        items.forEach((item) => {
          const option = document.createElement("option");
          option.value = item._id;
          option.text = item.name;
          targetSelect.appendChild(option);
        });
      });
    },
    preConfirm: () => {
      const targetSelect = document.getElementById("targetIds");
      const selectedTargetIds = Array.from(targetSelect.selectedOptions).map(
        (o) => o.value
      );

      const name = document.getElementById("swal-input-name").value.trim();
      const code = document.getElementById("swal-input-code").value.trim();
      const discountType = document.getElementById("swal-input-type").value;
      const discountValue = document.getElementById("swal-input-value").value;
      const maxAmount = document.getElementById("swal-input-max").value;
      const appliesTo = document.getElementById("appliesTo").value;
      const startDate = document.getElementById("swal-input-start").value;
      const endDate = document.getElementById("swal-input-end").value;
      const status = document.getElementById("swal-input-status").value;

      if (selectedTargetIds.length === 0) {
        Swal.showValidationMessage("⚠️ Targets is required!");
        return false;
      }

      if (
        !name ||
        !code ||
        !discountType ||
        !appliesTo ||
        !discountValue ||
        !startDate ||
        !endDate
      ) {
        Swal.showValidationMessage("⚠️ All fields are required!");
        return false;
      }

      if (discountType === "Percentage" && !maxAmount) {
        Swal.showValidationMessage(
          "⚠️ Max Discount Amount is required for Percentage type!"
        );
        return false;
      }

      if (code !== offer.code) {
        $.ajax({
          url: "/admin/offers/check-code",
          method: "POST",
          data: { code },
          async: false,
          success: function (response) {
            if (response.isUnique) {
              Swal.showValidationMessage("⚠️ Offer code must be unique!");
              return false;
            }
          },
        });
      }

      $.ajax({
        url: "/admin/offers/check-Date",
        method: "POST",
        data: { startDate, endDate },
        async: false,
        success: function (response) {
          if (!response.valid) {
            Swal.showValidationMessage(`⚠️ ${response.message}`);
            return false;
          }
        },
      });

      $.ajax({
        url: "/admin/offers/check-discount",
        method: "POST",
        data: { discountType, discountValue, maxAmount },
        async: false,
        success: function (response) {
          if (!response.valid) {
            Swal.showValidationMessage(`⚠️ ${response.message}`);
            return false;
          }
        },
      });
      return {
        id,
        name,
        code,
        discountType,
        discountValue,
        maxAmount,
        appliesTo,
        targetIds: selectedTargetIds,
        startDate,
        endDate,
        isActive: status === "true",
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "PATCH",
        url: "/admin/offers",
        contentType: "application/json",
        data: JSON.stringify(result.value),
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Offer Updated Successfully",
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

function deleteOffer(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This action will delete the offer permanently.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        type: "DELETE",
        url: `/admin/offers`,
        data: { id },
        success: function (response) {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Offer Deleted Successfully",
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
