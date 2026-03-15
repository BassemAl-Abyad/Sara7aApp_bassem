import { findByID, findOne } from "../DB/database.repository.js";
import TokenModel from "../DB/Models/token.model.js";
import UserModel from "../DB/Models/user.model.js";
import { tokenTypeEnum, signatureEnum } from "../Utils/enums/user.enum.js";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
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

  // Check if token is permanently revoked (blacklisted) ---> logout
  if (await findOne({ model: TokenModel, filter: { jti: decoded.jti } }))
    throw UnauthorizedException({ message: "Token is revoked." });

  const user = await findByID({ model: UserModel, id: decoded.id });
  if (!user) throw NotFoundException({ message: "Account not registered." });

  if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000)
    throw UnauthorizedException({ message: "Token is expired." });

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
