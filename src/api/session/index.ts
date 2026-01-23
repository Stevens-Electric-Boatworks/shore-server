import express from "express";

import LatestSession from "./latest";

const router = express.Router();

router.get("/latest");

export default router;
