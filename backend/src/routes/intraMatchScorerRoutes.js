const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
    getScorecard,
    getPublicScorecard,
    startMatch,
    recordDelivery,
    undoDelivery,
    startSecondInnings,
    changeBowler,
    finalizeMatch,
} = require("../controllers/intraMatchScorerController");

const router = express.Router();
router.get("/:selectionId/public", getPublicScorecard);
router.use(authMiddleware);
router.get("/:selectionId", getScorecard);
router.post("/:selectionId/start", startMatch);
router.post("/:selectionId/deliveries", recordDelivery);
router.delete("/:selectionId/last-delivery", undoDelivery);
router.post("/:selectionId/second-innings", startSecondInnings);
router.patch("/:selectionId/bowler", changeBowler);
router.post("/:selectionId/finalize", finalizeMatch);

module.exports = router;
