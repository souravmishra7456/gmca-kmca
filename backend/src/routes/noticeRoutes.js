const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getNotices, createNotice, deleteNotice } = require("../controllers/noticeController");

router.get("/", getNotices);
router.post("/", authMiddleware, createNotice);
router.delete("/:noticeId", authMiddleware, deleteNotice);

module.exports = router;
