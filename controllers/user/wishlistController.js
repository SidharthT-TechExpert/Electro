const mongoose = require("mongoose");
const wishlistSchema = require("../../models/wishlistSchema");

const addWishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { productId, variantId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User not logged in" });
    }

    if (!productId || !variantId) {
      return res.json({
        success: false,
        message: "Product or variant ID missing",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(variantId)
    ) {
      return res.json({
        success: false,
        message: "Invalid product or variant ID",
      });
    }

    // 🔹 Find wishlist for user
    let wishlist = await wishlistSchema.findOne({ userId });

    // 🔹 If wishlist not found, create it using upsert
    if (!wishlist) {
      await wishlistSchema.updateOne(
        { userId },
        {
          $push: {
            products: { productId, variantId },
          },
        },
        { upsert: true }
      );

      const WishlistS = await wishlistSchema.findOne({ userId });
      const wishlistCount = WishlistS?.products?.length || 0;

      return res.status(200).json({
        success: true,
        wishlistCount,
        message: "Product added to wishlist",
        wishlist: WishlistS,
      });
    }

    // 🔹 Ensure products array exists
    if (!Array.isArray(wishlist.products)) wishlist.products = [];
    
    console.log(variantId)

    // 🔹 Check if product already exists
    const index = wishlist.products.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        item.variantId.toString() === variantId.toString()
    );

    // 🔹 If product exists → remove it
    if (index !== -1) {
      wishlist.products.splice(index, 1);
      await wishlist.save();

      const WishlistS = await wishlistSchema.findOne({ userId });
      const wishlistCount = WishlistS?.products?.length || 0;

      return res.status(200).json({
        success: true,
        wishlistCount,
        removed: true,
        message: "Product removed from wishlist",
        wishlist: WishlistS,
      });
    }

    // 🔹 Otherwise add it
    wishlist.products.push({ productId, variantId });
    await wishlist.save();

    const WishlistS = await wishlistSchema.findOne({ userId });
    const wishlistCount = WishlistS?.products?.length || 0;

    return res.status(200).json({
      success: true,
      wishlistCount,
      message: "Product added to wishlist",
      wishlist: WishlistS,
    });
  } catch (error) {
    console.error("❌ Error adding/removing from wishlist:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
};

module.exports = {
  addWishlist,
};
