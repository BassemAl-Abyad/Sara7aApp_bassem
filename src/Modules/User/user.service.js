import * as dbService from "../../DB/database.repository.js";
import { successResponse } from "../../Utils/Response/success.response.js";
import UserModel from "../../DB/Models/user.model.js";
import { decrypt } from "../../Utils/Security/encryption.security.js";
import { verifyToken } from "../../Utils/Tokens/token.js";

export const getProfile = async (req, res) => {
  const { authorization } = req.headers;

  const decoded = verifyToken({ token: authorization });

  const user = await dbService.findByID({
    model: UserModel,
    id: decoded.id,
  });

  if (user) {
    user.phone = await decrypt(user.phone);
  }

  return successResponse({
    res,
    message: "Done",
    statusCode: 200,
    data: { user },
  });
};
