import { findByID, findByIDAndUpdate, updateOne } from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { BadRequestException } from "../../Utils/Response/error.response.js";
import { successResponse } from "../../Utils/Response/success.response.js";
import { decrypt } from "../../Utils/Security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/Security/hash.security.js";

export const getProfile = async (req, res) => {
  if ((req, res)) {
    req.user.phone = await decrypt(req.user.phone);
  }

  return successResponse({
    res,
    message: "Done",
    statusCode: 200,
    data: req.user,
  });
};

export const updateProfilePic = async (req, res) => {
  const user = await findByIDAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: {
      profilePic: req.file.finalPath,
    },
  });

  return successResponse({
    res,
    message: "Done",
    statusCode: 200,
    data: { user },
  });
};

export const updateCoverPic = async (req, res) => {
  const user = await findByIDAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: {
      coverPic: req.files?.map((file) => file.finalPath),
    },
  });

  return successResponse({
    res,
    message: "Done",
    statusCode: 200,
    data: { user },
  });
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const user = await findByID({
    model: UserModel,
    id: req.user._id,
  });

  const isValidPassword = await compareHash({
    plaintext: oldPassword,
    ciphertext: user.password,
    algo: HashEnum.Argon,
  });

  if (!isValidPassword)
    throw BadRequestException({ message: "Invalid password." });

  const hashPassword = await generateHash({
    plaintext: newPassword,
    algo: HashEnum.Argon,
  });

  await updateOne({
    model: UserModel,
    filter: { _id: req.user._id },
    update: {
      password: hashPassword,
    },
  });

  return successResponse({
    res,
    message: "Password updated successfully.",
    statusCode: 200,
  });
};
