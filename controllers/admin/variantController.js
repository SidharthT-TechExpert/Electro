const productSchema = require("../../models/productSchema");
const variantSchema = require("../../models/variantSchema");
const categorieSchema = require("../../models/categorySchema");
const brandSchema = require("../../models/brandSchema");
const HTTP_STATUS = require("../../config/statusCodes");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// =============== Multer Config for Image Upload ===============
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/uploads/variants");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// =============== Add Variant ===============//
const addVariants = async (req, res) => {
  try {
    console.log("Started");
    const { id } = req.params; // product ID
    let { color, description, price, sku, ...specifications } = req.body;

    // Find product
    const product = await productSchema.findById(id);
    if (!product) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Product not found" });
    }

    // Check duplicate SKU
    const existSku = await variantSchema.findOne({ sku });

    if (existSku) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "This SKU already exists, please enter a unique SKU",
      });
    }

    // Create new variant
    const newVariant = new variantSchema({
      product_id: id,
      color,
      description,
      price,
      sku,
      specifications,
    });

    await newVariant.save();

    res.json({
      success: true,
      message: "Variant added successfully",
      variant: newVariant,
    });
  } catch (err) {
    console.error("Error adding variant:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error" });
  }
};

// =============== Edit Variant ===============
const editVariants = async (req, res) => {
  try {
    const { id } = req.params; // variant ID

    // Destructure main fields and collect the rest as specifications
    let { color, description, price, sku, ...specifications } = req.body;

    const variantData = {
      color,
      description,
      price,
      sku,
      specifications, // nested automatically
    };

    const variant = await variantSchema.findByIdAndUpdate(id, variantData, {
      new: true,
    });

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    res.json({
      success: true,
      message: "Variant updated successfully",
      variant,
    });
  } catch (err) {
    console.error("Error editing variant:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error" });
  }
};

// =============== Delete Variant ===============
const deleteVariants = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update in one go
    const variant = await variantSchema.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true } // return the updated document
    );

    if (!variant) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Variant not found" });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Variant soft deleted successfully",
      variant,
    });
  } catch (err) {
    console.error("Error deleting variant:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error" });
  }
};

// =============== Upload Variant Image ===============
const uploadVariantImage = async (req, res) => {
  try {
    const { variantId } = req.params;

    // Check variant exists
    const variant = await variantSchema.findById(variantId);

    if (!variant) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Variant not found" });
    }

    //Check img uploded validation
    if (variant.product_image && variant.product_image.length >= 6) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Maximum 6 images are allowed per variant",
      });
    }

    // Multer upload File
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: err.message });
      }
      
      //File Validation
      if (!req.file) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: "No image file provided" });
      }

      // File Type Validation
      if (!req.file.mimetype.startsWith("image/")) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: "Invalid image file Formate!" });
      }

      try {
        // Generate image URL
        const imageUrl = `/uploads/variants/${req.file.filename}`;

        // Add image to product_image array
        if (!variant.product_image) {
          variant.product_image = [];
        }
        variant.product_image.push(imageUrl);

        await variant.save();

        res.json({
          success: true,
          message: "Image uploaded successfully",
          imageUrl: imageUrl,
        });
      } catch (saveErr) {
        // Clean up uploaded file if save fails
        fs.unlinkSync(req.file.path);
        throw saveErr;
      }
    });
  } catch (err) {
    console.error("Error uploading variant image:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error" });
  }
};

// =============== Delete Variant Image ===============
const deleteVariantImage = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { imageUrl } = req.body;

    const variant = await variantSchema.findById(variantId);
    if (!variant) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Variant not found" });
    }

    // Remove from DB array
    if (variant.product_image?.length) {
      variant.product_image = variant.product_image.filter(
        (img) => img !== imageUrl
      );
      await variant.save();
    }

    // Get absolute path safely
    const filename = path.basename(imageUrl);
    const filePath = path.resolve(
      process.cwd(),
      "public/uploads/variants",
      filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File deleted successfully");
    } else {
      console.warn("File not found at path:", filePath);
    }

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting variant image:", err);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Server error" });
  }
};

const checkSKU = async (req, res) => {
  try {
    const { sku, variantId } = req.body;
    const existsSKU = await variantSchema.findOne({ sku });

    if (existsSKU && existsSKU._id.toString() !== variantId) {
      return res.json({ exists: true });
    }

    return res.json({ exists: false });
  } catch (error) {
    console.log("Check SKU Error", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

module.exports = {
  addVariants,
  editVariants,
  deleteVariants,
  uploadVariantImage,
  deleteVariantImage,
  checkSKU,
};
