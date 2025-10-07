const mongoose = require("mongoose");
const { Schema } = mongoose;

const bannerSchema = new Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {         
    type: String,
    default: "",
  },
  description: {
    type: String,
    required: false,
  },
  buttonText: {      
    type: String,
    default: "Shop Now",
  },
  buttonLink: {       
    type: String,
    default: "/shop",
  },
  order: {             
    type: Number,
    default: 0,
  },
  isActive: {          
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
