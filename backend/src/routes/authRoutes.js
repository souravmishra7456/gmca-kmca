const express = require("express");
const router = express.Router();

const {
    login,
    getMe,
    logout,
    changePassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/change-password", changePassword);
router.get("/me", authMiddleware, getMe);
router.post("/logout", logout);

module.exports = router;
