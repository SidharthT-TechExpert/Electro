const Cart = require("../../models/cartSchema");
const Wishlist = require("../../models/wishlistSchema");

const addToCart = async (req, res) => {
  try {
    const { productId, variantId } = req.body;

    if (!req.session.userId) {
      return res.json({
        success: false,
        message: "Please log in to add items to cart",
      });
    }

    const userId = req.session.userId;

    // Check if the product with this variant is already in the cart
    const cart = await Cart.findOne({
      userId,
      "products.product_id": productId,
      "products.variant_id": variantId,
    });

    if (cart) {
      // Increment quantity if product exists
      await Cart.updateOne(
        {
          userId,
          "products.product_id": productId,
          "products.variant_id": variantId,
        },
        { $inc: { "products.$.quantity": 1 } } // <-- use positional $
      );

      return res.json({
        success: true,
        update: true,
        message: "Product Quantity updated in your cart",
      });
    } else {
      // Add new product if it doesn't exist
      const addProductToCart = await Cart.updateOne(
        { userId },
        {
          $push: {
            products: {
              product_id: productId,
              variant_id: variantId,
              quantity: 1,
              added_On: new Date(),
            },
          },
        },
        { upsert: true } // creates cart if it doesn't exist
      );

      const cart = await Cart.findOne({ userId }); // wait for the query
      const cartCount = cart?.products?.length || 0; // safe check

      if (addProductToCart) {
        // ✅ Correct way to remove product from wishlist
        await Wishlist.updateOne(
          { userId },
          {
            $pull: {
              products: {
                productId,
                variantId,
              },
            },
          }
        );

        const wishlist = await Wishlist.findOne({ userId });
        const wishlistCount = wishlist.products.length;
        console.log("Product removed from wishlist after adding to cart");
        return res.json({
          success: true,
          cartCount,
          wishlistCount,
          removed: true,
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addToCart,
};
