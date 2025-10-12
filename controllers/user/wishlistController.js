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

    // Find wishlist for user
    let wishlist = await wishlistSchema.findOne({ userId });

    if (!wishlist) {
      wishlist = new wishlistSchema({
        userId,
        products: [{ productId, variantId }],
      });
      await wishlist.save();
      return res
        .status(200)
        .json({
          success: true,
          removed: false,
          message: "Product added to wishlist",
          wishlist,
        });
    }

    if (!wishlist.products) wishlist.products = [];

    // Find product in wishlist
    const index = wishlist.products.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        item.variantId.toString() === variantId.toString()
    );

    if (index !== -1) {
      // Product + variant exists → remove it
      wishlist.products.splice(index, 1);

      await wishlist.save();
      
      return res
        .status(200)
        .json({
          success: true,
          removed:true,
          wishlist,
        });
    }

    // Product + variant doesn't exist → add it
    wishlist.products.push({ productId, variantId });

    await wishlist.save();

    return res
      .status(200)
      .json({ success: true, message: "Product added to wishlist", wishlist });
  
    } catch (error) {
    console.error("❌ Error adding/removing from wishlist:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  addWishlist,
};
