import { Router } from "express";
import * as authService from "./auth.service.js";
import * as authValidation from "./auth.validation.js";
import { authentication } from "../../Middleware/auth.middleware.js";
import { tokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { validation } from "../../Middleware/validation.middleware.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.signupSchema),
  authService.signUp,
);
router.post("/login", validation(authValidation.loginSchema), authService.login);
router.post(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.Refresh }),
  authService.refreshToken,
);
router.post("/social-login", authService.loginWithGoogle);
export default router;
