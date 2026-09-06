const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getNotices, createNotice } = require("../controllers/noticeController");

router.get("/", getNotices);
router.post("/", authMiddleware, createNotice);

module.exports = router;
