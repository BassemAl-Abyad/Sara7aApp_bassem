import { Router } from "express";
import * as messageValidation from "./message.validation.js";
import * as messageService from "./message.service.js";
import { authentication } from "../../Middleware/auth.middleware.js";
import { validation } from "../../Middleware/validation.middleware.js";
import { successResponse } from "../../Utils/Response/success.response.js";

const router = Router();

router.post(
  "/send",
  authentication(),
  validation(messageValidation.sendMessageSchema),
  async (req, res, next) => {
    try {
      const message = await messageService.sendMessage(req, res, next);
      return successResponse({
        res,
        message: "Message sent successfully.",
        data: message,
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/",
  authentication(),
  validation(messageValidation.getMessagesSchema),
  async (req, res, next) => {
    try {
      const result = await messageService.getMessages(req, res, next);
      return successResponse({
        res,
        message: "Messages retrieved successfully.",
        data: result.messages,
        metaData: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
