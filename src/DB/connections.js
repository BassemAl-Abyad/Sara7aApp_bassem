import mongoose from "mongoose";
import logger from "../Utils/logger.utils.js";
import { DB_URI } from "../../config/config.service.js";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      logger.database("connected", "MongoDB");
    });
    
    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error:", error);
    });
    
    mongoose.connection.on("disconnected", () => {
      logger.warning("MongoDB disconnected");
    });
    
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
  }
};

export default connectDB;
