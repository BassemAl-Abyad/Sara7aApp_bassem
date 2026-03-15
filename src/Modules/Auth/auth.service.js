import { CLIENT_ID } from "../../../config/config.service.js";
import { create, findOne } from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { ProviderEnum } from "../../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ConflictException,
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

  const user = await create({
    model: UserModel,
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: encryptedData,
    },
  });
  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully.",
    data: { user },
  });
}

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
