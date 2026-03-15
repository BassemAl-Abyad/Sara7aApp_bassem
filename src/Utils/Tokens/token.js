import jwt from "jsonwebtoken";
import {
  ACCESS_EXPIRES,
  REFRESH_ADMIN_SECRET_KEY,
  REFRESH_EXPIRES,
  REFRESH_USER_SECRET_KEY,
  TOKEN_ADMIN_ACCESS_KEY,
  TOKEN_USER_ACCESS_KEY,
} from "../../../config/config.service.js";
import { RoleEnum, signatureEnum } from "../enums/user.enum.js";
import { v4 as uuidv4 } from "uuid";

export const generateToken = (
  payload,
  secretKey = TOKEN_USER_ACCESS_KEY,
  options = { expiresIn: ACCESS_EXPIRES },
) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey = TOKEN_USER_ACCESS_KEY }) => {
  return jwt.verify(token, secretKey);
};

export const getSignature = ({ signatureLevel = signatureEnum.User }) => {
  let signature = { accessSignature: undefined, refreshSignature: undefined };
  switch (signatureLevel) {
    case signatureEnum.Admin:
      signature.accessSignature = TOKEN_ADMIN_ACCESS_KEY;
      signature.refreshSignature = REFRESH_ADMIN_SECRET_KEY;
      break;
    case signatureEnum.User:
      signature.accessSignature = TOKEN_USER_ACCESS_KEY;
      signature.refreshSignature = REFRESH_USER_SECRET_KEY;
      break;
    default:
      signature.accessSignature = TOKEN_USER_ACCESS_KEY;
      signature.refreshSignature = REFRESH_USER_SECRET_KEY;
      break;
  }
  return signature;
};

export const getNewLoginCredentials = async (user) => {
  const signature = await getSignature({
    signatureLevel:
      user.role != RoleEnum.Admin ? signatureEnum.User : signatureEnum.Admin,
  });
  const jwtid = uuidv4();  

  const accessToken = generateToken(
    {id: user._id, email: user.email},
    signature.accessSignature,
    {expiresIn: ACCESS_EXPIRES, jwtid},
  )

  const refreshToken = generateToken(
    {id: user._id, email: user.email},
    signature.refreshSignature,
    {expiresIn: REFRESH_EXPIRES, jwtid},
  )
  
  return {accessToken, refreshToken}
};
