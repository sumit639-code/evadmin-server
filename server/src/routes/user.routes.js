import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.middleware.js";
import { getUsers, updateUserStatus } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/getUsers", authenticateToken, requireAdmin, getUsers);
router.put("/user-status/:userId", authenticateToken, requireAdmin, updateUserStatus);



export default router;