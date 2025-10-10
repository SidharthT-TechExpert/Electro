const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, sparse: true, default: null },
  password: { type: String },
  googleId: { type: String, sparse: true, unique: true },
  isBlocked: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  cart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
  wallet: [{ type: Schema.Types.ObjectId, ref: "Wallet" }],
  orderHistory: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  addresses:[{type:Schema.Types.ObjectId,ref:'address'}],
  createdOn: { type: Date, default: Date.now },
  referalCode: { type: String },
  redeemed: { type: Boolean, default: false },
  redeemedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  rememberMe: { type: Boolean, default: false },
  searchHistory: [
    {
      category: { type: Schema.Types.ObjectId, ref: "Category" },
      brand: { type: String },
      searchOn: { type: Date, default: Date.now },
    },
  ],

  // ✅ Add this field for profile photo
  profilePhoto: {
    type: Schema.Types.ObjectId, // will store GridFS file ID
    ref: "fs.files",
    default: null,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
