import { successResponse } from "../../Utils/Response/success.response.js";
import { decrypt } from "../../Utils/Security/encryption.security.js";

export const getProfile = async (req, res) => {
  if (req,res) {
    req.user.phone = await decrypt(req.user.phone);
  }

  return successResponse({
    res,
    message: "Done",
    statusCode: 200,
    data: req.user,
  });
};
