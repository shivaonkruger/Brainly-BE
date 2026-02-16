const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/brainly";

console.log("Mongoose Version:", mongoose.version);
console.log("Attempting to connect to:", MONGO_URI);

const options = {
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout
};

mongoose.connect(MONGO_URI, options)
    .then(() => {
        console.log("Connected to MongoDB successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Connection failed details:", err.message);
        console.error("Full error:", err);
        process.exit(1);
    });
