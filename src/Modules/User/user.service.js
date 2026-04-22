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
import {
  generateOTP,
  generateOTPWithExpiration,
} from "../../Utils/generateOTP.js";
import { emailEvent } from "../../Utils/Events/email.events.js";

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

export const sendRestoreAccountEmail = async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await findOne({
    model: UserModel,
    filter: { email },
  });

  if (!user)
    throw BadRequestException({
      message: "User not found.",
    });

  if (!user.freezedAt)
    throw BadRequestException({
      message: "Account is not frozen.",
    });

  // Check if OTP has expired or max attempts reached before allowing resend
  const canResend =
    !user.restoreAccountOTPExpires ||
    new Date() > user.restoreAccountOTPExpires ||
    user.restoreAccountOTPAttempts >= 3;

  if (!canResend) {
    const timeRemaining = Math.ceil(
      (user.restoreAccountOTPExpires - new Date()) / (1000 * 60),
    );
    throw BadRequestException({
      message: `Please wait ${timeRemaining} minutes before requesting a new OTP.`,
    });
  }

  const { otp, expiresAt } = generateOTPWithExpiration();

  const hashedOTP = await generateHash({
    plaintext: otp,
    algo: HashEnum.Argon,
  });

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      restoreAccountOTP: hashedOTP,
      restoreAccountOTPExpires: expiresAt,
      restoreAccountOTPAttempts: 0,
    },
  });

  // call event emitter to send email
  emailEvent.emit("restoreAccount", { email, otp, firstName: user.firstName });

  return successResponse({
    res,
    statusCode: 200,
    message: "Account restoration OTP has been sent to your email.",
  });
};

export const restoreAccountByEmail = async (req, res) => {
  const { email, otp } = req.body;

  // First check if user exists
  const user = await findOne({
    model: UserModel,
    filter: { email },
  });

  if (!user)
    throw BadRequestException({
      message: "User not found.",
    });

  if (!user.freezedAt)
    throw BadRequestException({
      message: "Account is not frozen.",
    });

  // Check if OTP exists
  if (!user.restoreAccountOTP) {
    throw BadRequestException({
      message: "No OTP found. Please request a new one.",
    });
  }

  // Check if OTP has expired
  if (user.restoreAccountOTPExpires && new Date() > user.restoreAccountOTPExpires) {
    throw BadRequestException({
      message: "OTP has expired. Please request a new one.",
    });
  }

  // Check if maximum attempts reached
  if (user.restoreAccountOTPAttempts >= 3) {
    throw BadRequestException({
      message: "Maximum OTP attempts reached. Please request a new one.",
    });
  }

  const isOTPValid = await compareHash({
    plaintext: otp,
    ciphertext: user.restoreAccountOTP,
    algo: HashEnum.Argon,
  });

  if (!isOTPValid) {
    // Check if this would be the 3rd attempt (current attempts = 2)
    if (user.restoreAccountOTPAttempts >= 2) {
      // This is the 3rd attempt, block and show max reached message
      await updateOne({
        model: UserModel,
        filter: { email },
        update: { restoreAccountOTPAttempts: 3 },
      });
      throw BadRequestException({
        message: "Maximum OTP attempts reached. Please request a new one.",
      });
    }

    // Increment attempt counter for attempts 1 and 2
    const newAttempts = (user.restoreAccountOTPAttempts || 0) + 1;
    await updateOne({
      model: UserModel,
      filter: { email },
      update: { restoreAccountOTPAttempts: newAttempts },
    });

    throw BadRequestException({
      message: "Invalid OTP. Please try again.",
    });
  }

  // Restore the account
  const updateUser = await findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: user._id,
      freezedAt: { $exists: true },
    },
    update: {
      restoredAt: Date.now(),
      restoredBy: user._id, // User restored their own account
      $unset: {
        freezedAt: true,
        freezedBy: true,
        restoreAccountOTP: true,
        restoreAccountOTPExpires: true,
        restoreAccountOTPAttempts: true,
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