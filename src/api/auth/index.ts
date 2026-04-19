import express from "express";

import LoginHandler from "./login";
import LogoutHandler from "./logout";
import RegisterHandler from "./register";
import RefreshHandler from "./refresh";
import AuthMiddleware from "@/auth";

const router = express.Router();

router.post("/login", LoginHandler);
router.post("/logout", LogoutHandler);
router.post("/register", RegisterHandler);
router.post("/refresh", RefreshHandler);

export default router;
