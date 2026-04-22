import { generalFields } from "../../Middleware/validation.middleware.js";
import joi from "joi";

export const sendMessageSchema = {
  body: {
    content: generalFields.password.min(2).max(500).required().messages({
      "string.min": "Message must be at least 2 characters.",
      "string.max": "Message must not exceed 500 characters.",
      "any.required": "Message content is required.",
    }),
    receiverId: generalFields.id.required().messages({
      "any.required": "Receiver ID is required.",
    }),
  },
};

export const getMessagesSchema = {
  query: {
    page: joi.number().positive().integer().default(1),
    limit: joi.number().positive().integer().default(10),
    receiverId: generalFields.id.optional(),
  },
};
