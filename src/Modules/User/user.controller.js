import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middleware/auth.middleware.js";
import { RoleEnum, tokenTypeEnum } from "../../Utils/enums/user.enum.js";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/Multer/local.multer.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  coverImagesValidation,
  updateProfilePicSchema,
} from "./user.validation.js";

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
  localFileUpload({
    customPath: "User",
    validation: [...fileValidation.images],
  }).single("attachments"),
  validation(updateProfilePicSchema),
  userService.updateProfilePic,
);

router.patch(
  "/update-cover-pic",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  localFileUpload({
    customPath: "User",
    validation: [...fileValidation.images],
  }).array("attachments", 5),
  validation(coverImagesValidation),
  userService.updateCoverPic,
);

export default router;
