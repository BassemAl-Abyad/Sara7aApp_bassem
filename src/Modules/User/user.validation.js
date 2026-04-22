import joi from "joi";
import { fileValidation } from "../../Utils/Multer/local.multer.js";
import { generalFields } from "../../Middleware/validation.middleware.js";
import { REGEX_PATTERNS } from "../../Utils/regex.utils.js";

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

export const updateProfileSchema = {
  body: joi.object({
    firstName: generalFields.firstName,
    lastName: generalFields.lastName,
    email: generalFields.email,
    phone: generalFields.phone,
    username: generalFields.username,
    age: generalFields.age.min(13).max(120),
  }),
};

export const updateUsernameSchema = {
  body: joi.object({
    username: generalFields.username.required(),
  }),
};

export const addSocialLinkSchema = {
  body: joi.object({
    platform: joi.string().valid('facebook', 'twitter', 'instagram', 'linkedin', 'github').required(),
    url: generalFields.url.required(),
  }),
};

export const updateBioSchema = {
  body: joi.object({
    bio: joi.string().min(1).max(500).pattern(REGEX_PATTERNS.MESSAGE_CONTENT).required()
      .messages({
        "string.min": "Bio must be at least 1 character.",
        "string.max": "Bio must not exceed 500 characters.",
        "any.required": "Bio is required.",
      }),
  }),
};