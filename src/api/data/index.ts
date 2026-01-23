import express from "express";

import DownloadHandler from "./download";
import FieldsHandler from "./fields";

const router = express.Router();

router.get("/fields", FieldsHandler);
router.get("/download", DownloadHandler);

export default router;
