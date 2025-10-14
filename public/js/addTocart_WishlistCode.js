document.addEventListener("DOMContentLoaded", () => {
  const wishlistButtons = document.querySelectorAll(".wishlist-toggle");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  // Initialize wishlist buttons
  wishlistButtons.forEach((btn) => {
    const productId = btn.dataset.productId;
    const variantId = btn.dataset.variantId;
    const icon = btn.querySelector("i");

    // Set initial state
    const isWishlisted = userWishlist.some(
      (p) =>
        String(p.productId) === String(productId) &&
        String(p.variantId) === String(variantId)
    );
    icon.classList.toggle("fas", isWishlisted);
    icon.classList.toggle("far", !isWishlisted);
    btn.style.color = isWishlisted ? "red" : "#1f1f1f";

    // Add click listener
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWishlist(productId, variantId, btn);
    });
  });

  // Initialize add-to-cart buttons
  addToCartButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
          const productId = btn.dataset.productId;
          const variantId = btn.dataset.variantId; // read the current value dynamically
      addToCart(productId, variantId); 
    });
  });
});

// Wishlist toggle lock to prevent rapid clicks
const wishlistLock = {};

async function toggleWishlist(productId, variantId, btn) {
  if (!user) {
    return Swal.fire({
      icon: "info",
      title: "Please login first!",
      showConfirmButton: true,
    }).then(() => (location.href = "/logIn"));
  }

  if (!productId || !variantId) {
    return Swal.fire({
      icon: "error",
      title: "Product or variant not selected!",
      showConfirmButton: true,
    });
  }

  const key = `${productId}-${variantId}`;
  if (wishlistLock[key]) return;
  wishlistLock[key] = true;

  const icon = btn.querySelector("i");
  const currentlyAdded = icon.classList.contains("fas");

  // Optimistic UI toggle
  icon.classList.toggle("fas", !currentlyAdded);
  icon.classList.toggle("far", currentlyAdded);
  btn.style.color = !currentlyAdded ? "red" : "#1f1f1f";

  try {
    const { data } = await axios.post("/shop/wishlist", {
      productId,
      variantId,
    });
    
    const countEl = document.getElementById("wishlist-count");

    if (data.success) {
      const removed = !!data.removed;
      icon.classList.toggle("fas", !removed);
      icon.classList.toggle("far", removed);
      btn.style.color = removed ? "#1f1f1f" : "red";

      if (countEl) countEl.innerText = data.wishlistCount;
    } else {
      // Revert UI
      icon.classList.toggle("fas", currentlyAdded);
      icon.classList.toggle("far", !currentlyAdded);
      btn.style.color = currentlyAdded ? "red" : "#1f1f1f";

      Swal.fire({
        icon: "error",
        title: data.message || "Something went wrong!",
        showConfirmButton: true,
      });
    }
  } catch (err) {
    // Revert UI on error
    icon.classList.toggle("fas", currentlyAdded);
    icon.classList.toggle("far", !currentlyAdded);
    btn.style.color = currentlyAdded ? "red" : "#1f1f1f";

    Swal.fire({
      icon: "error",
      title: "Error updating wishlist",
      timer: 1500,
      showConfirmButton: false,
    });
    console.error("Wishlist update error:", err);
  } finally {
    setTimeout(() => (wishlistLock[key] = false), 500);
  }
}

async function addToCart(productId, variantId) {
  if (!user) {
    return Swal.fire({
      icon: "info",
      title: "Please login first!",
      showConfirmButton: true,
    }).then(() => (location.href = "/logIn"));
  }

  if (!productId || !variantId) {
    return Swal.fire({
      icon: "error",
      title: "Product or variant not selected!",
      showConfirmButton: true,
    });
  }

  try {
    const response = await axios.post("/cart/add", {
      productId,
      variantId,
      quantity: 1,
    });

    const cartCountEl = document.getElementById("cart-count");
    const wishlistCountEl = document.getElementById("wishlist-count");

    // 🧠 If item was removed from wishlist after adding to cart
    if (response.data.removed) {
      if (wishlistCountEl)
        wishlistCountEl.textContent = response.data.wishlistCount;

      // 🩶 Find that wishlist heart and reset its style
      const wishlistBtn = document.querySelector(
        `.wishlist-toggle[data-product-id="${productId}"][data-variant-id="${variantId}"]`
      );
      if (wishlistBtn) {
        const heartIcon = wishlistBtn.querySelector("i");
        if (heartIcon) {
          heartIcon.classList.remove("fas");
          heartIcon.classList.add("far");
          wishlistBtn.style.color = "#1f1f1f"; // default gray/black
        }
      }
    }

    // ✅ Show alert
    Swal.fire({
      icon: response.data.success ? "success" : "error",
      title:
        response.data.message ||
        (response.data.success ? "Added to cart!" : "Error"),
      timer: 1500,
      showConfirmButton: false,
    });

    // ✅ Update cart count
    if (response.data.cartCount && cartCountEl)
      cartCountEl.textContent = response.data.cartCount;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error adding to cart",
      timer: 1500,
      showConfirmButton: false,
    });
    console.error(err);
  }
}
