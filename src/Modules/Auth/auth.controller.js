import { Router } from "express";
import * as authService from "./auth.service.js";

const router = Router();

router.post("/signup", authService.signUp);
router.post("/login", authService.login);
router.post("/refresh-token", authService.refreshToken)

export default router;
