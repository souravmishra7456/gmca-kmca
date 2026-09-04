const express = require("express");
const router = express.Router();

const {
    createPlayer,
    getPlayers,
    updatePlayerProfile,
    updatePlayerStats,
} = require("../controllers/playerController");

router.get("/", getPlayers);
router.post("/", createPlayer);
router.put("/:playerId/profile", updatePlayerProfile);
router.put("/:playerId/stats", updatePlayerStats);

module.exports = router;
