import express from "express";

import LoginHandler from "./login";
import LogoutHandler from "./logout";
import RegisterHandler from "./register";
import RefreshHandler from "./refresh";
import MeHandler from "./me";
import AuthMiddleware from "@/auth";

const router = express.Router();

router.post("/login", LoginHandler);
router.post("/logout", AuthMiddleware, LogoutHandler);
router.post("/register", AuthMiddleware, RegisterHandler);
router.post("/refresh", RefreshHandler);
router.get("/me", AuthMiddleware, MeHandler);

export default router;
