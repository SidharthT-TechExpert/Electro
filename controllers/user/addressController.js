const userSchema = require("../../models/userSchema");
const HTTP_STATUS = require("../../config/statusCodes");
const addressSchema = require("../../models/addressSchema");
const axios = require("axios");

// Check user session and fetch user
const checkSession = async (id) => {
  try {
    return id ? await userSchema.findById(id) : null;
  } catch (error) {
    console.error("Session check error:", error);
    return null;
  }
};

const get_Address_page = async (req, res) => {
  try {
    const user = await checkSession(req.session.userId);

    if (!user) return res.status(401).send("User not logged in");

    const addresses = await addressSchema.find({ userId: user._id });

    res.render("home/address-book", {
      user,
      addresses,
      page: "address-book",
      cartCount: req.cartCount || null,
    });
  } catch (error) {
    console.error("Error loading profile page:", error);
    res.status(500).send("Internal Server Error");
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ success: false, message: "User session expired" });
    }

    const {
      name,
      phone,
      altPhone,
      city,
      district,
      landMark,
      state,
      pincode,
      addressType,
    } = req.body;

    if (!name || !phone || !city || !state || !pincode || !district) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Please fill all required fields" });
    }

    await addressSchema.create({
      userId,
      name,
      phone,
      altPhone,
      city,
      district,
      landMark,
      state,
      pincode,
      addressType,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Address added successfully",
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.body;

    // Delete the address
    const result = await addressSchema.findByIdAndDelete(id);

    if (!result) {
      // Send response and exit
      return res
        .status(axios.HttpStatusCode.NotFound)
        .json({ success: false, message: "Address not found" });
    }

    // Only send one response
    return res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    // Send error response only once
    return res
      .status(axios.HttpStatusCode.InternalServerError)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const get_Details = async (req, res) => {
  const address = await addressSchema.findById(req.params.id);

  if (!address)
    return res
      .status(axios.HttpStatusCode.NotFound)
      .json({ success: false, message: "Address not found" });

  res.json({ success: true, address });
};

const editAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      altPhone,
      city,
      state,
      district,
      landMark,
      pincode,
      addressType,
    } = req.body;

    // Optional: Validate required fields
    if (!name || !phone || !city || !state || !district || !pincode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const updatedAddress = await addressSchema.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        altPhone,
        city,
        state,
        district,
        landMark,
        pincode,
        addressType,
      },
      { new: true } 
    );

    if (!updatedAddress) {
      return res
        .status(axios.HttpStatusCode.NotFound)
        .json({ success: false, message: "Address not found" });
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Update address error:", error);
    res
      .status(axios.HttpStatusCode.InternalServerError)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  get_Address_page,
  addAddress,
  deleteAddress,
  get_Details,
  editAddress,
};
