const productSchema = require("../../models/productSchema");
const variantSchema = require("../../models/variantSchema");
const categorieSchema = require("../../models/categorySchema");
const brandSchema = require("../../models/brandSchema");
const HTTP_STATUS = require("../../config/statusCodes");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Configure multer for image uploads
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
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add Variants
const addVariants = async (req, res) => {
  try {
    const { id } = req.params; // product ID
    const variantData = req.body; // data from form

    // 1️⃣ Find product by ID
    const product = await productSchema.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    const existSku = await variantSchema.findOne({ sku: variantData.sku });

    if (existSku) {
      return res
        .status(404)
        .json({
          success: false,
          message: "This SKU already exists , Please enter a unique SKU",
        });
    }

    // 2️⃣ Create new variant linked to this product
    const newVariant = new variantSchema({
      product_id: product._id,
      ...variantData,
    });

    await newVariant.save();

    // 3️⃣ Return success response
    res.json({
      success: true,
      message: "Variant added successfully",
      variant: newVariant,
    });
  } catch (err) {
    console.error("Error adding variant:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Variants
const deleteVariants = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await variantSchema.findByIdAndDelete(id);

    if (!variant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "Variant not found" });
    }
    
    res.json({
      success: true,
      message: "Variant deleted successfully",
      variant,
    });
  }
  catch (err) {
    console.error("Error deleting variant:", err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
  }
};

// Edit Variants
const editVariants = async (req, res) => {
  try {
    const { id } = req.params;
    const variantData = req.body;
    const variant = await variantSchema.findAndUpdate(
      { product_id: id, sku: variantData.sku },
      variantData,
      { new: true }
    );

    if (!variant) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "Variant not found" });
    }

    res.json({
      success: true,
      message: "Variant updated successfully",
      variant,
    });

  } catch (err) {
    console.error("Error editing variant:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Upload Variant Image
const uploadVariantImage = async (req, res) => {
  try {
    const { variantId } = req.params;
    
    // Check if variant exists
    const variant = await variantSchema.findById(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // Use multer middleware
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file provided" });
      }

      try {
        // Generate image URL
        const imageUrl = `/uploads/variants/${req.file.filename}`;
        
        // Add image to variant's product_image array
        if (!variant.product_image) {
          variant.product_image = [];
        }
        variant.product_image.push(imageUrl);
        
        await variant.save();

        res.json({
          success: true,
          message: "Image uploaded successfully",
          imageUrl: imageUrl
        });
      } catch (saveErr) {
        // Clean up uploaded file if save fails
        fs.unlinkSync(req.file.path);
        throw saveErr;
      }
    });
  } catch (err) {
    console.error("Error uploading variant image:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Variant Image
const deleteVariantImage = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { imageUrl } = req.body;
    
    // Check if variant exists
    const variant = await variantSchema.findById(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // Remove image from variant's product_image array
    if (variant.product_image && variant.product_image.length > 0) {
      variant.product_image = variant.product_image.filter(img => img !== imageUrl);
      await variant.save();
    }

    // Delete file from filesystem
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, "../../public/uploads/variants", filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting variant image:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addVariants,
  editVariants,
  deleteVariants,
  uploadVariantImage,
  deleteVariantImage,
};
