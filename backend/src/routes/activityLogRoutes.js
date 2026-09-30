const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getActivityLogs, deleteActivityLog } = require("../controllers/activityLogController");

const router = express.Router();

router.get("/", authMiddleware, getActivityLogs);
router.delete("/:activityId", authMiddleware, deleteActivityLog);

module.exports = router;
