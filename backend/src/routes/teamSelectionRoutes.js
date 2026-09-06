const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getTeamSelections, createTeamSelection, deleteTeamSelection } = require("../controllers/teamSelectionController");

router.get("/", authMiddleware, getTeamSelections);
router.post("/", authMiddleware, createTeamSelection);
router.delete("/:selectionId", authMiddleware, deleteTeamSelection);

module.exports = router;
