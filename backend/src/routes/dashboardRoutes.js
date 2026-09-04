const express = require("express");
const router = express.Router();
const { getAssociationStats } = require("../controllers/dashboardController");

router.get("/stats", getAssociationStats);

module.exports = router;
