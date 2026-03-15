import joi from "joi";
import { BadRequestException } from "../Utils/Response/error.response.js";
import { Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../Utils/enums/user.enum.js";

export const generalFields = {
  firstName: joi
    .string()
    .alphanum()
    .min(3)
    .max(25)
    .messages({ "any.required": "First name is required." })
    .messages({ "string.min": "First name must be at least 3 characters." })
    .messages({ "string.max": "First name must be at most 25 characters." }),
  lastName: joi
    .string()
    .alphanum()
    .min(3)
    .max(25)
    .messages({ "any.required": "Last name is required." })
    .messages({ "string.min": "Last name must be at least 3 characters." })
    .messages({ "string.max": "Last name must be at most 25 characters." }),
  email: joi
    .string()
    .email({
      minDomainSegments: 1,
      maxDomainSegments: 3,
      tlds: { allow: ["com", "net", "org"] },
    })
    .messages({ "any.required": "Email is required." }),
  age: joi.number().positive().integer(),
  password: joi.string().messages({ "any.required": "Password is required." }),
  confirmPassword: joi.ref("password"),
  phone: joi
    .string()
    .pattern(/^01[0125]{1}[0-9]{8}$/)
    .messages({ "string.pattern.base": "Invalid phone number." }), // EGY phone number
  id: joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) ||
      helper.message("Invalid ObjectId format.")
    );
  }),
  gender: joi.string().valid(...Object.values(GenderEnum)),
  role: joi.string().valid(...Object.values(RoleEnum)),
  provider: joi.string().valid(...Object.values(ProviderEnum)),

};

export const validation = (schema) => {
  return (req, res, next) => {
    const validationError = [];

    for (const key of Object.keys(schema)) {
      const validationResults = schema[key].validate(req[key], {
        abortEarly: false,
      });
      console.log(`Validation Results for ${key}: `, validationResults);
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
