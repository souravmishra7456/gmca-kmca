const express = require("express");
const router = express.Router();

const {
    createPlayer,
    getPlayers,
    updatePlayerProfile,
    updatePlayerStats,
    demoteDirector,
    assignDirector,
} = require("../controllers/playerController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getPlayers);
router.post("/", createPlayer);
router.put("/:playerId/profile", updatePlayerProfile);
router.put("/:playerId/stats", updatePlayerStats);
router.patch("/:playerId/demote-director", authMiddleware, demoteDirector);
router.patch("/:playerId/assign-director", authMiddleware, assignDirector);

module.exports = router;
