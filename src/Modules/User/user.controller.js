import { Router } from "express";
import * as userService from "./user.service.js";

const router = Router();

router.get("/", userService.getProfile)

export default router;
