import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middleware/auth.middleware.js";
import { tokenTypeEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post("/signup", authService.signUp);
router.post("/login", authService.login);
router.post("/refresh-token", authentication({ tokenType: tokenTypeEnum.Refresh }), authService.refreshToken)
router.post("/social-login", authService.loginWithGoogle)
export default router;
