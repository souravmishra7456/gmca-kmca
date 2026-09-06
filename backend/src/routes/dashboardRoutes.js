const express = require("express");
const router = express.Router();
const { getAssociationStats, getMyUpcomingSelection } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/stats", getAssociationStats);
router.get("/my-team-selection", authMiddleware, getMyUpcomingSelection);

module.exports = router;
