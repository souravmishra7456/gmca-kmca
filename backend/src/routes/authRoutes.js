const express = require("express");
const router = express.Router();

const {
    login,
    getMe,
    logout,
    changePassword,
    requestPasswordReset,
    getPasswordResetRequests,
    approvePasswordReset,
    recoverChairmanPassword,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", requestPasswordReset);
router.get("/password-reset-requests", authMiddleware, getPasswordResetRequests);
router.post("/password-reset-requests/:requestId/approve", authMiddleware, approvePasswordReset);
router.post("/chairman-password-recovery", recoverChairmanPassword);
router.get("/me", authMiddleware, getMe);
router.post("/logout", logout);

module.exports = router;
