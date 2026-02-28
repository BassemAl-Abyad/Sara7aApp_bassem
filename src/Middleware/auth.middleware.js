import { findByID } from "../DB/database.repository.js";
import UserModel from "../DB/Models/user.model.js";
import { tokenTypeEnum, signatureEnum } from "../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../Utils/Response/error.response.js";
import { getSignature, verifyToken } from "../Utils/Tokens/token.js";

export const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.Access,
}) => {
  const [Bearer, token] = authorization.split(" ") || [];

  if (!Bearer || !token)
    throw BadRequestException({ message: "Invalid token." });

  let signature = await getSignature({
    signatureLevel:
      Bearer.toLowerCase() === "admin"
        ? signatureEnum.Admin
        : signatureEnum.User,
  });

  const decoded = verifyToken({
    token,
    secretKey:
      tokenType === tokenTypeEnum.Access
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  const user = await findByID({ model: UserModel, id: decoded.id });
  if (!user) throw NotFoundException({ message: "Account not registered." });

  return { user, decoded };
};

export const authentication = ({ tokenType = tokenTypeEnum.Access }) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRoles = [] }) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role))
      throw ForbiddenException({ message: "Unauthorized access." });
    return next();
  };
};
