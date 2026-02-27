import * as dbService from "../../DB/database.repository.js";
import { successResponse } from "../../Utils/Response/success.response.js";
import UserModel from "../../DB/Models/user.model.js";
import { decrypt } from "../../Utils/Security/encryption.security.js";

export const getProfile = async (req, res) => {
  const { id } = req.params;
  const user = await dbService.findByID({
    model: UserModel,
    id: id,
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
