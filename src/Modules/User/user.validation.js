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

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
    confirmNewPassword: joi.ref("newPassword"),
  },)
};

export const freezeAccountSchema = {
  params: joi.object({
    userId: generalFields.id,
  },)
};

export const restoreAccountSchema = {
  params: joi.object({
    userId: generalFields.id,
  },)
};

export const sendRestoreEmailSchema = {
  body: joi.object({
    email: generalFields.email.required(),
  },)
};

export const restoreAccountByEmailSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  },)
};

export const hardDeleteAccountSchema = {
  params: joi.object({
    userId: generalFields.id.required(),
  },)
};