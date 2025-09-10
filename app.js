const express = require('express');
const env = require('dotenv').config();
const connectDB = require('./config/db');

const app = express();


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
}); 

connectDB();
module.exports = app;
