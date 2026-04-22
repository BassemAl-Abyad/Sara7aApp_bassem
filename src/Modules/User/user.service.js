import {
  findByID,
  findByIDAndUpdate,
  findOneAndUpdate,
  updateOne,
} from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { RoleEnum } from "../../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "../../Utils/Response/error.response.js";
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

export const freezeAccount = async (req, res) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user._id;

  // Check if user is trying to freeze someone else's account
  if (userId && req.user.role !== RoleEnum.Admin)
    throw ForbiddenException({
      message: "Only admins can freeze other accounts.",
    });

  // Check if the target account exists and is already frozen
  const targetUser = await findByID({
    model: UserModel,
    id: targetUserId,
  });

  if (!targetUser)
    throw BadRequestException({
      message: "User not found.",
    });

  if (targetUser.freezedAt)
    throw BadRequestException({
      message: "Account is already frozen.",
    });

  // Users cannot freeze their own accounts if they're not admins
  if (!userId && req.user.role !== RoleEnum.Admin)
    throw ForbiddenException({
      message: "Only admins can freeze accounts.",
    });

  const updateUser = await findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: targetUserId,
      freezedAt: { $exists: false },
    },
    update: {
      freezedAt: Date.now(),
      freezedBy: req.user._id,
      $unset: {
        restoredBy: true,
        restoredAt: true,
      },
    },
  });

  return successResponse({
    res,
    message: "Account frozen successfully.",
    statusCode: 200,
    data: { updateUser },
  });
};

export const restoreAccount = async (req, res) => {
  const { userId } = req.params;
  const targetUserId = userId || req.user._id;

  // Check if the target account exists and is frozen
  const targetUser = await findByID({
    model: UserModel,
    id: targetUserId,
  });

  if (!targetUser)
    throw BadRequestException({
      message: "User not found.",
    });

  if (!targetUser.freezedAt)
    throw BadRequestException({
      message: "Account is not frozen.",
    });

  // Check if user is trying to restore someone else's account
  if (userId && req.user.role !== RoleEnum.Admin)
    throw ForbiddenException({
      message: "Only admins can restore other accounts.",
    });

  // Users cannot restore their own accounts if they're not admins
  if (!userId && req.user.role !== RoleEnum.Admin)
    throw ForbiddenException({
      message: "Only admins can restore accounts.",
    });

  // Check if the user trying to restore is the same user who froze the account
  if (targetUser.freezedBy && targetUser.freezedBy.toString() === req.user._id.toString())
    throw ForbiddenException({
      message: "You cannot restore an account that you froze.",
    });

  const updateUser = await findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: targetUserId,
      freezedAt: { $exists: true },
    },
    update: {
      restoredAt: Date.now(),
      restoredBy: req.user._id,
      $unset: {
        freezedAt: true,
        freezedBy: true,
      },
    },
  });

  return successResponse({
    res,
    message: "Account restored successfully.",
    statusCode: 200,
    data: { updateUser },
  });
};