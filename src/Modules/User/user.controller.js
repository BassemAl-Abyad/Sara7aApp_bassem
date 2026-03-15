import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middleware/auth.middleware.js";
import { RoleEnum, tokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { localFileUpload } from "../../Utils/Multer/local.multer.js";

const router = Router();

router.get(
  "/",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  userService.getProfile,
);

router.patch(
  "/update-profile-pic",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  localFileUpload({ customPath: "User" }).single("attachments"),

  userService.updateProfilePic,
);

export default router;
