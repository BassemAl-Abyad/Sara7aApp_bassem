import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middleware/auth.middleware.js";
import { RoleEnum, tokenTypeEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.get(
  "/",
  authentication({ tokenType: tokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  userService.getProfile,
);

export default router;
