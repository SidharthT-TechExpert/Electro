const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    // Connect to MongoDB using Mongoose
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    // Return the native db object for GridFS
    return mongoose.connection.db;
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
