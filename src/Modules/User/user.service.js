import { findByIDAndUpdate } from "../../DB/database.repository.js";
import UserModel from "../../DB/Models/user.model.js";
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
    data: {user},
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
    data: {user},
  });
};