import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minLength: [2, "Message must be at least 2 characters."],
      maxLength: [500, "Message must not exceed 500 characters."],
      trim: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const MessageModel = mongoose.model("Message", messageSchema);
export default MessageModel;
