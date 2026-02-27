import { Router } from "express";
import * as userService from "./user.service.js";

const router = Router();

router.get("/:id", userService.getProfile)

export default router;
