// --- Helpers ---
const escapeHtml = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getVariantValue = (vd, f) => {
  if (!vd) return "";
  if (vd[f] !== undefined && vd[f] !== null) return vd[f];
  if (vd.specifications) {
    try {
      if (typeof vd.specifications.get === "function") {
        return vd.specifications.get(f) ?? "";
      }
      return vd.specifications[f] ?? "";
    } catch (e) {
      return "";
    }
  }
  return "";
};

// --- Open variant from element (edit) or handle add-mode ---
function openVariantFromData(el) {
  try {
    console.log("openVariantFromData called, el:", el);
    if (!el || !el.dataset || !el.dataset.variant) {
      console.log("No variant data found — opening Add Variant");
      return openVariantPopup({});
    }

    const variantStr =
      el.getAttribute("data-variant") || el.dataset.variant || "";
    const decoded = decodeURIComponent(variantStr || "");
    const variantData = decoded ? JSON.parse(decoded) : {};
    console.log("Parsed variantData:", variantData);
    openVariantPopup(variantData);
  } catch (err) {
    console.error("Failed to parse variant data:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not load variant data.",
    });
  }
}

// --- Main popup builder & handler ---
function openVariantPopup(variantData = {}) {
  console.log("openVariantPopup called with:", variantData);
  const variantFields = window.variantFields || []; // ✅ from EJS injection

  if (!Array.isArray(variantFields)) {
    console.error("variantFields invalid.");
    return Swal.fire({
      icon: "error",
      title: "Server Error",
      text: "Invalid variant field configuration.",
    });
  }

  let formHtml = `<form id="swalVariantForm" class="row g-3" onsubmit="return false;">`;
  variantFields.forEach((f) => {
    if (!["description", "images"].includes(f)) {
      const type = ["price", "stock"].includes(f) ? "number" : "text";
      const step = f === "price" ? 'step="0.01"' : "";
      const val = escapeHtml(getVariantValue(variantData, f));
      const placeholder = escapeHtml(f.charAt(0).toUpperCase() + f.slice(1));
      formHtml += `
      <div class="col-md-4 mb-3">
        <label for="${f}" class="form-label fw-semibold text-start text-capitalize d-block">
          ${placeholder}
        </label>
        <input
          type="${type}"
          id="${f}"
          name="${f}"
          class="form-control shadow-sm rounded-3"
          ${step}
          value="${val}"
          placeholder="${placeholder}"
          required
        >
      </div>`;
    }
  });

  if (variantFields.includes("description")) {
    const desc = escapeHtml(variantData.description || "");
    formHtml += `
      <div class="col-12">
        <textarea name="description" class="form-control" placeholder="Description">${desc}</textarea>
      </div>`;
  }

  formHtml += `</form>`;

  Swal.fire({
    title: variantData._id ? "Edit Variant" : "Add Variant",
    html: formHtml,
    customClass: "swal-wide",
    showCancelButton: true,
    confirmButtonText: variantData._id ? "Update" : "Save",
    focusConfirm: false,
    allowOutsideClick: () => !Swal.isLoading(),

    preConfirm: async () => {
      const form = document.getElementById("swalVariantForm");
      if (!form) {
        Swal.showValidationMessage("Form not found.");
        return false;
      }

      const fd = new FormData(form);
      const data = {};
      let hasEmpty = false;

      fd.forEach((value, key) => {
        if (typeof value === "string" && value.trim() === "") hasEmpty = true;
        if (["price", "stock"].includes(key)) {
          const num = Number(value);
          data[key] = isNaN(num) ? value : num;
        } else {
          data[key] = value;
        }
      });

      if (hasEmpty) {
        Swal.showValidationMessage("Please fill out all fields!");
        return false;
      }

      if ("sku" in data) {
        try {
          Swal.showLoading();
          const resp = await fetch("/admin/products/variants/check-sku", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sku: data.sku, variantId: variantData._id }),
          });

          if (!resp.ok) throw new Error("SKU check network error");
          const json = await resp.json();
          if (json.exists) {
            Swal.hideLoading();
            Swal.showValidationMessage("SKU already exists!");
            return false;
          }
        } catch (err) {
          Swal.hideLoading();
          Swal.showValidationMessage("Error checking SKU: " + err.message);
          return false;
        } finally {
          Swal.hideLoading();
        }
      }

      return data;
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      saveVariant(result.value, variantData._id);
    }
  });
}

// --- Save variant ---
async function saveVariant(data, variantId = undefined) {
  const productId = window.productId; // ✅ from EJS injection
  const url = variantId
    ? `/admin/products/variants/edit/${variantId}`
    : `/admin/products/${productId}/variants`;

  const method = variantId ? "PUT" : "POST";
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (json.success) {
      Swal.fire({
        icon: "success",
        title: variantId ? "Variant Updated" : "Variant Added",
        text: json.message || "Saved successfully!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => location.reload());
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: json.message || "Save failed",
      });
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "Server Error", text: err.message });
  }
}

// --- Delete variant ---
function deleteVariant(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the variant.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/admin/products/variants/delete/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: "Deleted",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => location.reload());
          } else {
            Swal.fire("Error", response.message || "Delete failed", "error");
          }
        })
        .catch(() => Swal.fire("Server Error", "Try again later.", "error"));
    }
  });
}

// --- Image handling ---
let cropper = null;
let currentVariantId = null;

document.querySelector(".variants-table")?.addEventListener("click", (e) => {
  const placeholder = e.target.closest(".image-upload-placeholder");
  if (!placeholder) return;
  const box = placeholder.closest(".add-image-box");
  if (!box) return;
  const variantId = box.dataset.variantId;
  if (variantId) addImg(variantId);
});

function addImg(variantId) {
  currentVariantId = variantId;
  Swal.fire({
    title: "Upload & Crop Image",
    html: `
      <input type="file" id="swalImageFile" class="swal2-file mb-2" accept="image/*">
      <div id="swalImagePreview" style="margin-top:10px; display:none;">
        <img id="swalPreviewImg" style="max-width:100%;" />
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Upload",
    didOpen: () => {
      const fileInput = document.getElementById("swalImageFile");
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
          const previewDiv = document.getElementById("swalImagePreview");
          const img = document.getElementById("swalPreviewImg");
          previewDiv.style.display = "block";
          img.src = reader.result;
          if (cropper) cropper.destroy();
          cropper = new Cropper(img, {
            aspectRatio: NaN,
            viewMode: 2,
            autoCropArea: 1,
          });
        };
        reader.readAsDataURL(file);
      });
    },
    preConfirm: () => {
      if (!cropper) {
        Swal.showValidationMessage("Please select and crop an image!");
        return false;
      }

      return new Promise((resolve, reject) => {
        cropper.getCroppedCanvas().toBlob(async (blob) => {
          try {
            const fd = new FormData();
            fd.append("image", blob, "variant.jpg");
            const res = await fetch(
              `/admin/products/variants/${currentVariantId}/images`,
              {
                method: "POST",
                body: fd,
              }
            );
            const json = await res.json();
            if (json.success) resolve(json);
            else reject(json.message);
          } catch (err) {
            reject(err.message);
          }
        }, "image/jpeg");
      });
    },
  })
    .then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Image Uploaded",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => location.reload());
      }
    })
    .catch((err) =>
      Swal.fire({ icon: "error", title: "Upload Failed", text: err })
    );
}

document
  .querySelector(".variants-table")
  ?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".remove-existing-image");
    if (!btn) return;
    const variantId = btn.closest(".variant-image-container")?.dataset
      .variantId;
    const imageUrl = btn.dataset.image;
    if (!variantId || !imageUrl) return;

    const confirmRes = await Swal.fire({
      title: "Are you sure?",
      text: "This image will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmRes.isConfirmed) {
      try {
        const res = await fetch(
          `/admin/products/variants/${variantId}/images`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl }),
          }
        );
        const json = await res.json();
        if (json.success) {
          Swal.fire({
            icon: "success",
            title: "Image Deleted",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => location.reload());
        } else {
          Swal.fire("Error", json.message, "error");
        }
      } catch (err) {
        Swal.fire("Server Error", err.message, "error");
      }
    }
  });

// --- Product list / unlist ---
function isListed(id, isBlocked) {
  isBlocked = isBlocked === "true";
  Swal.fire({
    title: "Are you sure?",
    text: isBlocked
      ? "This will list the product. It will be visible to users."
      : "This will unlist the product. It will not be visible to users.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: isBlocked ? "Yes, list it!" : "Yes, unlist it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/admin/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isBlocked: !isBlocked }),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: response.message,
              showConfirmButton: false,
              timer: 1500,
            }).then(() => location.reload());
          } else {
            Swal.fire("Error", response.message, "error");
          }
        })
        .catch(() => Swal.fire("Server Error", "Try again later.", "error"));
    }
  });
}

// --- Delete product ---
function deleteProduct(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the product.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/admin/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success) {
            Swal.fire({
              icon: "success",
              title: response.message,
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              location.href = "/admin/products";
            });
          } else {
            Swal.fire("Error", response.message, "error");
          }
        })
        .catch(() => Swal.fire("Server Error", "Try again later.", "error"));
    }
  });
}

/* Edit Product Modal */
function editProduct(product, brands, categories) {
  Swal.fire({
    title: '<h2><i class="fas fa-edit"></i> Edit Product</h2>',
    html: `
        <div class="mb-3 text-start">
          <label for="swal-edit-name" class="form-label fw-semibold">Product Name</label>
          <input type="text" id="swal-edit-name" class="form-control" value="${
            product.name
          }">
        </div>
        <div class="mb-3 text-start">
          <label for="swal-edit-brand" class="form-label fw-semibold">Brand</label>
          <select id="swal-edit-brand" class="form-select">
            ${brands
              .map(
                (b) =>
                  `<option value="${b._id}" ${
                    product.brand === b.name ? "selected" : ""
                  }>${b.name}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="mb-3 text-start">
          <label for="swal-edit-category" class="form-label fw-semibold">Category</label>
          <select id="swal-edit-category" class="form-select">
            ${categories
              .map(
                (c) =>
                  `<option value="${c._id}" ${
                    product.category === c.name ? "selected" : ""
                  }>${c.name}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="mb-3 text-start">
          <label for="swal-edit-status" class="form-label fw-semibold">Stock Status</label>
          <select id="swal-edit-status" class="form-select">
            <option value="In Stock" ${
              product.status === "In Stock" ? "selected" : ""
            }>In Stock</option>
            <option value="Out of Stock" ${
              product.status === "Out of Stock" ? "selected" : ""
            }>Out of Stock</option>
            <option value="Not Listed" ${
              product.status === "Not Listed" ? "selected" : ""
            }>Not Listed</option>
          </select>
        </div>
      `,
    showCancelButton: true,
    confirmButtonText: "Update Product",
    preConfirm: () => ({
      name: document.getElementById("swal-edit-name").value.trim(),
      brand: document.getElementById("swal-edit-brand").value,
      category: document.getElementById("swal-edit-category").value,
      status: document.getElementById("swal-edit-status").value,
    }),
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.value),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.success)
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Product updated successfully!",
              timer: 1500,
              showConfirmButton: false,
            }).then(() => location.reload());
        })
        .catch((err) =>
          Swal.fire("Server Error", "Please try again later.", "error")
        );
    }
  });
}
