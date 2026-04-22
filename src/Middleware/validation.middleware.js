import joi from "joi";
import { BadRequestException } from "../Utils/Response/error.response.js";
import { Types } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../Utils/enums/user.enum.js";
import { REGEX_PATTERNS } from "../Utils/regex.utils.js";

export const generalFields = {
  firstName: joi
    .string()
    .pattern(REGEX_PATTERNS.FIRST_NAME)
    .min(3)
    .max(25)
    .messages({ "any.required": "First name is required." })
    .messages({ "string.min": "First name must be at least 3 characters." })
    .messages({ "string.max": "First name must be at most 25 characters." })
    .messages({ "string.pattern.base": "First name can only contain letters." }),
  lastName: joi
    .string()
    .pattern(REGEX_PATTERNS.LAST_NAME)
    .min(3)
    .max(25)
    .messages({ "any.required": "Last name is required." })
    .messages({ "string.min": "Last name must be at least 3 characters." })
    .messages({ "string.max": "Last name must be at most 25 characters." })
    .messages({ "string.pattern.base": "Last name can only contain letters." }),
  email: joi
    .string()
    .email({
      minDomainSegments: 1,
      maxDomainSegments: 3,
      tlds: { allow: ["com", "net", "org"] },
    })
    .messages({ "any.required": "Email is required." }),
  age: joi.number().positive().integer(),
  password: joi
    .string()
    .pattern(REGEX_PATTERNS.PASSWORD)
    .messages({ "any.required": "Password is required." })
    .messages({ "string.pattern.base": "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character." }),
  strongPassword: joi
    .string()
    .pattern(REGEX_PATTERNS.STRONG_PASSWORD)
    .messages({ "string.pattern.base": "Strong password must be at least 12 characters with uppercase, lowercase, number, and special character." }),
  confirmPassword: joi.ref("password"),
  phone: joi
    .string()
    .pattern(REGEX_PATTERNS.EGYPT_PHONE)
    .messages({ "string.pattern.base": "Invalid Egyptian phone number." }),
  id: joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) ||
      helper.message("Invalid ObjectId format.")
    );
  }),
  gender: joi.string().valid(...Object.values(GenderEnum)),
  role: joi.string().valid(...Object.values(RoleEnum)),
  provider: joi.string().valid(...Object.values(ProviderEnum)),
  file: {
    fieldname: joi.string(),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    size: joi.number().positive(),
    destination: joi.string(),
    filename: joi.string(),
    path: joi.string(),
    finalPath: joi.string(),
  },
  otp: joi.string().pattern(REGEX_PATTERNS.OTP),
  username: joi
    .string()
    .pattern(REGEX_PATTERNS.USERNAME)
    .min(3)
    .max(20)
    .messages({ "string.pattern.base": "Username can only contain letters, numbers, and underscores." }),
  url: joi
    .string()
    .pattern(REGEX_PATTERNS.URL)
    .messages({ "string.pattern.base": "Invalid URL format." }),
  slug: joi
    .string()
    .pattern(REGEX_PATTERNS.SLUG)
    .messages({ "string.pattern.base": "Slug can only contain lowercase letters, numbers, and hyphens." }),
  messageContent: joi
    .string()
    .pattern(REGEX_PATTERNS.MESSAGE_CONTENT)
    .messages({ "string.pattern.base": "Message content is required and must be 1-500 characters." }),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const validationError = [];

    for (const key of Object.keys(schema)) {
      const validationResults = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResults.error) {
        validationError.push({ key, details: validationResults.error.details });
      }
    }
    if (validationError.length) {
      throw BadRequestException(
        {
          message: "Validation Error: ",
        },
        validationError,
      );
    }
    return next();
  };
};
