const mongoose = require("mongoose");
const { Schema } = mongoose;

const bannerSchema = new Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: Schema.Types.String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate : {
        type : Date,
        required : true
  }
});

const Banner = mongoose.model("banner", bannerSchema);
module.exports = Banner;
