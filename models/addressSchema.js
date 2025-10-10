const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  altPhone: { type: String },
  city: { type: String, required: true },
  district:{ type: String, required: true },
  landMark: { type: String },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  addressType: { type: String, enum: ["Home", "Work"], default: "Home" },
},{timestamps:true});

module.exports = mongoose.model("address", addressSchema);
