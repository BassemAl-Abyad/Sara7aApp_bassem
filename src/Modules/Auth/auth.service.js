import {
  create,
  findOne,
} from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import {
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
      refreshToken: credentials.refreshToken 
    },
    statusCode: 200,
  });
};
