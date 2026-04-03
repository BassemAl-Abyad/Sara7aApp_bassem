import { ACCESS_EXPIRES, CLIENT_ID } from "../../../config/config.service.js";
import {
  create,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../DB/database.repository.js";
import TokenModel from "../../DB/Models/token.model.js";
import UserModel from "../../DB/Models/user.model.js";
import {
  set,
  revokeTokenKey,
  globalRevokeKey,
} from "../../DB/redis.service.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { LogoutTypeEnum, ProviderEnum } from "../../Utils/enums/user.enum.js";
import { emailEvent } from "../../Utils/Events/email.events.js";
import {
  generateOTP,
  generateOTPWithExpiration,
} from "../../Utils/generateOTP.js";
import {
  BadRequestException,
  ConflictException,
  errorResponse,
  NotFoundException,
} from "../../Utils/Response/error.response.js";
import { successResponse } from "../../Utils/Response/success.response.js";
import { encrypt } from "../../Utils/Security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/Security/hash.security.js";
import { getNewLoginCredentials } from "../../Utils/Tokens/token.js";
import { OAuth2Client } from "google-auth-library";

export const signUp = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  if (await findOne({ model: UserModel, filter: { email } }))
    throw ConflictException({ message: "User already exists." });

  const hashedPassword = await generateHash({
    plaintext: password,
    algo: HashEnum.Argon,
  });

  const encryptedData = await encrypt(phone);
  const { otp, expiresAt } = generateOTPWithExpiration();

  const hashedOTP = await generateHash({
    plaintext: otp,
    algo: HashEnum.Argon,
  });

  const user = await create({
    model: UserModel,
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: encryptedData,
      confirmEmailOTP: hashedOTP,
      confirmEmailOTPExpires: expiresAt,
      confirmEmailOTPAttempts: 0,
    },
  });

  // call event emitter to send email
  emailEvent.emit("confirmEmail", { email, otp, firstName });

  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully.",
    data: { user },
  });
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: { email },
  });

  if (!user) throw NotFoundException({ message: "User not found." });

  if (user.confirmEmail) {
    throw BadRequestException({ message: "Email is already confirmed." });
  }

  // Check if OTP has expired or max attempts reached before allowing resend
  const canResend =
    !user.confirmEmailOTPExpires ||
    new Date() > user.confirmEmailOTPExpires ||
    user.confirmEmailOTPAttempts >= 3;

  if (!canResend) {
    const timeRemaining = Math.ceil(
      (user.confirmEmailOTPExpires - new Date()) / (1000 * 60),
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
      confirmEmailOTP: hashedOTP,
      confirmEmailOTPExpires: expiresAt,
      confirmEmailOTPAttempts: 0,
    },
  });

  // call event emitter to send email
  emailEvent.emit("confirmEmail", { email, otp, firstName: user.firstName });

  return successResponse({
    res,
    statusCode: 200,
    message: "OTP has been resent successfully.",
  });
};

export const confirmEmail = async (req, res) => {
  const { email, otp } = req.body;

  // First check if user exists
  const user = await findOne({
    model: UserModel,
    filter: { email },
  });

  if (!user) throw NotFoundException({ message: "User not found." });

  // Check if email is already confirmed
  if (user.confirmEmail) {
    throw BadRequestException({ message: "Email is already confirmed." });
  }

  // Check if OTP exists
  if (!user.confirmEmailOTP) {
    throw BadRequestException({
      message: "No OTP found. Please request a new one.",
    });
  }

  // Check if OTP has expired
  if (user.confirmEmailOTPExpires && new Date() > user.confirmEmailOTPExpires) {
    throw BadRequestException({
      message: "OTP has expired. Please request a new one.",
    });
  }

  // Check if maximum attempts reached
  if (user.confirmEmailOTPAttempts >= 3) {
    throw BadRequestException({
      message: "Maximum OTP attempts reached. Please request a new one.",
    });
  }

  const isOTPValid = await compareHash({
    plaintext: otp,
    ciphertext: user.confirmEmailOTP,
    algo: HashEnum.Argon,
  });

  if (!isOTPValid) {
    console.log(
      "Before increment - User attempts:",
      user.confirmEmailOTPAttempts,
    );

    // Check if this would be the 3rd attempt (current attempts = 2)
    if (user.confirmEmailOTPAttempts >= 2) {
      // This is the 3rd attempt, block and show max reached message
      await updateOne({
        model: UserModel,
        filter: { email },
        update: { confirmEmailOTPAttempts: 3 },
      });
      throw BadRequestException({
        message: "Maximum OTP attempts reached. Please request a new one.",
      });
    }

    // Increment attempt counter for attempts 1 and 2
    const newAttempts = (user.confirmEmailOTPAttempts || 0) + 1;
    await updateOne({
      model: UserModel,
      filter: { email },
      update: { confirmEmailOTPAttempts: newAttempts },
    });

    console.log("After increment - New attempts:", newAttempts);

    const remainingAttempts = 3 - newAttempts;
    throw BadRequestException({
      message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
    });
  }

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      confirmEmail: Date.now(),
      $unset: {
        confirmEmailOTP: true,
        confirmEmailOTPExpires: true,
        confirmEmailOTPAttempts: true,
      },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Email confirmed successfully.",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findOne({ model: UserModel, filter: { email } });
  if (!user) throw NotFoundException({ message: "User not found." });

  const isPasswordValid = await compareHash({
    plaintext: password,
    ciphertext: user.password,
    algo: HashEnum.Argon,
  });

  if (!isPasswordValid)
    throw BadRequestException({ message: "Invalid email or password." });

  await updateOne({
    model: UserModel,
    filter: { _id: user._id },
    update: { changeCredentialsTime: null },
  });

  const credentials = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "Login successful.",
    data: { credentials },
  });
};

export const refreshToken = async (req, res) => {
  // Refactored code using authentication
  const user = req.user;
  const decoded = req.decoded;

  const credentials = await getNewLoginCredentials(user);

  return successResponse({
    res,
    message: "Token refreshed successfully.",
    data: {
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
    },
    statusCode: 200,
  });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;

  const { picture, email, given_name, family_name, email_verified } =
    await verifyGoogleAccount({ idToken });

  if (!email_verified)
    throw BadRequestException({ message: "Email not verified." });

  const user = await findOne({
    model: UserModel,
    filter: { email },
  });

  if (user) {
    // User Login
    if (user.provider === ProviderEnum.Google) {
      const credentials = await getNewLoginCredentials(user);
      return successResponse({
        res,
        message: "Login successful.",
        data: { credentials },
        statusCode: 200,
      });
    } else {
      throw ConflictException({
        message:
          "Email already exists with different login method. Please use regular login.",
      });
    }
  }

  // User Create
  const newUser = await create({
    model: UserModel,
    data: {
      firstName: given_name,
      lastName: family_name,
      email,
      profilePic: picture,
      provider: ProviderEnum.Google,
    },
  });

  const credentials = await getNewLoginCredentials(newUser);
  return successResponse({
    res,
    message: "Login successful.",
    data: { credentials },
    statusCode: 201,
  });
};

// logout with ttl of mongodb
export const logout = async (req, res) => {
  const { flag } = req.body;
  let status = 200;
  switch (flag) {
    case LogoutTypeEnum.logout:
      // Store revoked token with its original expiration time for TTL cleanup
      const tokenExpiration = new Date(req.decoded.exp * 1000);

      // Check if token already exists to prevent duplicate key error
      const existingToken = await findOne({
        model: TokenModel,
        filter: { jti: req.decoded.jti },
      });

      if (existingToken) {
        return errorResponse({
          res,
          message: "Token is revoked.",
        });
      }

      await create({
        model: TokenModel,
        data: {
          jti: req.decoded.jti,
          userId: req.user._id,
          expiresIn: tokenExpiration,
        },
      });
      status = 201;
      break;
    case LogoutTypeEnum.logoutFromAll:
      await updateOne({
        model: UserModel,
        filter: { _id: req.user._id },
        update: {
          changeCredentialsTime: Date.now(),
        },
      });
      status = 200;
      break;
  }
  return successResponse({
    res,
    message: "Logout successful.",
    statusCode: status,
  });
};

// logout with redis
export const logoutWithRedis = async (req, res) => {
  const { flag } = req.body;
  let status = 200;
  switch (flag) {
    case LogoutTypeEnum.logout:
      const tokenExpiration = new Date(req.decoded.exp * 1000);
      await set({
        key: revokeTokenKey({ userId: req.user._id, jti: req.decoded.jti }),
        value: req.decoded.jti,
        ttl: req.decoded.iat + ACCESS_EXPIRES,
      });
      status = 201;
      break;
    // Task
    case LogoutTypeEnum.logoutFromAll:
      await set({
        key: globalRevokeKey({ userId: req.user._id }),
        value: Date.now().toString(),
        ttl: ACCESS_EXPIRES,
      });
      status = 200;
      break;
  }
  return successResponse({
    res,
    message: "Logout successful.",
    statusCode: status,
  });
};

// forget password
export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  const hashOTP = await generateHash({
    plaintext: JSON.stringify(otp),
    algo: HashEnum.Argon,
  });

  const user = await findOneAndUpdate({
    model: UserModel,
    filter: {
      email,
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
    },
    update: {
      forgetPasswordOTP: hashOTP,
    },
  });

  if (!user) throw NotFoundException({ message: "User not found." });

  emailEvent.emit("forgetPassword", {
    to: email,
    otp,
    firstName: user.firstName,
  });

  return successResponse({
    res,
    message: "OTP sent successfully.",
    statusCode: 200,
  });
};

// reset password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
      forgetPasswordOTP: { $exists: true },
    },
  });

  if (!user) throw NotFoundException({ message: "User not found." });

  const isOTPValid = await compareHash({
    plaintext: JSON.stringify(otp),
    ciphertext: user.forgetPasswordOTP,
    algo: HashEnum.Argon,
  });

  if (!isOTPValid) throw BadRequestException({ message: "Invalid OTP." });

  const hashedPassword = await generateHash({
    plaintext: newPassword,
    algo: HashEnum.Argon,
  });

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      password: hashedPassword,
      $unset: { forgetPasswordOTP: true}
    },
  });

  return successResponse({
    res,
    message: "Password reset successfully.",
    statusCode: 200,
  });
};
