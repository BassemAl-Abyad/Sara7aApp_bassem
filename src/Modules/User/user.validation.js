import joi from "joi";
import { fileValidation } from "../../Utils/Multer/local.multer.js";
import { generalFields } from "../../Middleware/validation.middleware.js";

export const updateProfilePicSchema = {
  file: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("attachments").required(),
      originalname: generalFields.file.originalname.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      path: generalFields.file.encoding.required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.fieldname.required(),
      encoding: generalFields.file.encoding.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
    .required(),
};

export const coverImagesValidation = {
  file: joi
    .object({
      fieldname: generalFields.file.fieldname.valid("attachments").required(),
      originalname: generalFields.file.originalname.required(),
      mimetype: generalFields.file.mimetype
        .valid(...fileValidation.images)
        .required(),
      size: generalFields.file.size.max(5 * 1024 * 1024).required(),
      path: generalFields.file.encoding.required(),
      destination: generalFields.file.destination.required(),
      filename: generalFields.file.fieldname.required(),
      encoding: generalFields.file.encoding.required(),
      finalPath: generalFields.file.finalPath.required(),
    })
    .required(),
};
