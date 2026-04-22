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
import * as userValidation from "./user.validation.js";

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
  validation(userValidation.updateProfilePicSchema),
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
  validation(userValidation.coverImagesValidation),
  userService.updateCoverPic,
);

router.patch(
  "/update-password",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);

router.delete(
  "/freeze-account",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  userService.freezeAccount,
);

router.delete(
  "/:userId/freeze-account",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  validation(userValidation.freezeAccountSchema),
  userService.freezeAccount,
);

router.delete(
  "/:userId/restore-account",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [ RoleEnum.Admin] }),
  validation(userValidation.restoreAccountSchema),
  userService.restoreAccount,
);

router.post(
  "/send-restore-email",
  validation(userValidation.sendRestoreEmailSchema),
  userService.sendRestoreAccountEmail,
);

router.post(
  "/restore-by-email",
  validation(userValidation.restoreAccountByEmailSchema),
  userService.restoreAccountByEmail,
);

router.delete(
  "/:userId/hard-delete-account",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [ RoleEnum.Admin] }),
  validation(userValidation.hardDeleteAccountSchema),
  userService.hardDeleteAccount,
);

export default router;
