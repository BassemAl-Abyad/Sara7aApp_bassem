import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully.");
    });
    mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
