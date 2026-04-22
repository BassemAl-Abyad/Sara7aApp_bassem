import { findByID, create, find } from "../../DB/database.repository.js";
import MessageModel from "../../DB/Models/message.model.js";
import UserModel from "../../DB/Models/user.model.js";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/Response/error.response.js";

export const sendMessage = async (req, res, next) => {
  const { content, receiverId } = req.body;
  const senderId = req.user._id;

  if (receiverId === senderId.toString()) {
    throw BadRequestException({ message: "Cannot send message to yourself." });
  }

  const receiver = await findByID({ model: UserModel, id: receiverId });
  if (!receiver) {
    throw NotFoundException({ message: "Receiver not found." });
  }

  const message = await create({
    model: MessageModel,
    data: {
      content,
      receiverId,
      senderId,
    },
  });

  return message;
};

export const getMessages = async (req, res, next) => {
  const { page = 1, limit = 10, receiverId } = req.query;
  const userId = req.user._id;
  const skip = (page - 1) * limit;

  let filter = {
    $or: [
      { senderId: userId },
      { receiverId: userId }
    ]
  };

  if (receiverId) {
    filter = {
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    };
  }

  const messages = await find({
    model: MessageModel,
    filter,
    options: {
      populate: [
        { path: 'senderId', select: 'firstName lastName email profilePic' },
        { path: 'receiverId', select: 'firstName lastName email profilePic' }
      ],
      sort: { createdAt: -1 },
      skip,
      limit: parseInt(limit),
      lean: true
    }
  });

  const totalMessages = await MessageModel.countDocuments(filter);

  return {
    messages,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
      limit: parseInt(limit)
    }
  };
};
