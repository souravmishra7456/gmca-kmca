const User = require("../models/User");
const PasswordResetRequest = require("../models/PasswordResetRequest");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { createSession, deleteSession, SESSION_DURATION_MS } = require("../utils/sessionStore");
const { generateTempPassword } = require("../utils/playerHelpers");
const recordActivity = require("../utils/recordActivity");

const formatUser = (user) => ({
    id: user._id,
    memberId: user.memberId,
    name: user.name,
    role: user.role,
    username: user.username,
    firstLogin: user.firstLogin,
    playerProfile: user.playerProfile,
});

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });
        }

        const user = await User.findOne({ username });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const sessionId = createSession(user._id);
        await recordActivity({ actor: user, action: "Signed in", target: "Portal" });
        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: SESSION_DURATION_MS,
        });

        res.status(200).json({
            success: true,
            user: formatUser(user),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMe = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: formatUser(req.user),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const logout = async (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
        deleteSession(sessionId);
    }
    res.clearCookie("sessionId", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters",
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from the current password",
            });
        }

        const user = await User.findById(req.user._id);

        if (!user || !user.isActive) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.firstLogin = false;
        await user.save();
        await recordActivity({ actor: user, action: "Changed password", target: "Account security" });

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            user: formatUser(user),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const requestPasswordReset = async (req, res) => {
    try {
        const { username, memberId } = req.body;

        if (!username && !memberId) {
            return res.status(400).json({
                success: false,
                message: "Enter your username or member ID",
            });
        }

        const user = await User.findOne({
            isActive: true,
            $or: [
                ...(username ? [{ username: username.trim().toLowerCase() }] : []),
                ...(memberId ? [{ memberId: memberId.trim().toUpperCase() }] : []),
            ],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No active member matches that username or member ID",
            });
        }

        const pendingRequest = await PasswordResetRequest.findOne({
            user: user._id,
            status: "pending",
        });

        if (!pendingRequest) {
            await PasswordResetRequest.create({ user: user._id });
        }

        res.status(201).json({
            success: true,
            message: "The chairman has been notified of the reset request.",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPasswordResetRequests = async (req, res) => {
    try {
        if (req.user.role !== "chairman") {
            return res.status(403).json({ success: false, message: "Only the chairman can view password reset requests" });
        }

        const requests = await PasswordResetRequest.find({ status: "pending" })
            .populate("user", "name memberId username role isActive")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            requests: requests
                .filter((request) => request.user?.isActive)
                .map((request) => ({
                    id: request._id,
                    requestedAt: request.createdAt,
                    member: {
                        id: request.user._id,
                        name: request.user.name,
                        memberId: request.user.memberId,
                        username: request.user.username,
                        role: request.user.role,
                    },
                })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const approvePasswordReset = async (req, res) => {
    try {
        if (req.user.role !== "chairman") {
            return res.status(403).json({ success: false, message: "Only the chairman can approve password reset requests" });
        }

        const request = await PasswordResetRequest.findOne({
            _id: req.params.requestId,
            status: "pending",
        });
        if (!request) {
            return res.status(404).json({ success: false, message: "Pending password reset request not found" });
        }

        const user = await User.findOne({ _id: request.user, isActive: true });
        if (!user) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        const tempPassword = generateTempPassword();
        user.password = await bcrypt.hash(tempPassword, 10);
        user.firstLogin = true;
        await user.save();

        request.status = "approved";
        request.approvedBy = req.user._id;
        request.approvedAt = new Date();
        await request.save();
        await recordActivity({
            actor: req.user,
            action: "Approved password reset",
            target: user.name,
            details: `Generated a temporary password for ${user.memberId}.`,
        });

        res.status(200).json({
            success: true,
            message: "Temporary password generated. Share it securely with the member.",
            tempPassword,
            member: {
                id: user._id,
                name: user.name,
                memberId: user.memberId,
                username: user.username,
            },
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ success: false, message: "Password reset request not found" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const hasValidChairmanRecoveryKey = (providedKey) => {
    const configuredKey = process.env.CHAIRMAN_RECOVERY_KEY;

    if (!configuredKey || typeof providedKey !== "string") {
        return false;
    }

    const providedBuffer = Buffer.from(providedKey);
    const configuredBuffer = Buffer.from(configuredKey);
    return (
        providedBuffer.length === configuredBuffer.length &&
        crypto.timingSafeEqual(providedBuffer, configuredBuffer)
    );
};

const recoverChairmanPassword = async (req, res) => {
    try {
        if (!process.env.CHAIRMAN_RECOVERY_KEY) {
            return res.status(503).json({
                success: false,
                message: "Chairman password recovery is not configured",
            });
        }

        if (!hasValidChairmanRecoveryKey(req.get("x-chairman-recovery-key"))) {
            return res.status(401).json({
                success: false,
                message: "Invalid chairman recovery key",
            });
        }

        const chairman = await User.findOne({ role: "chairman", isActive: true });
        if (!chairman) {
            return res.status(404).json({ success: false, message: "Active chairman account not found" });
        }

        const tempPassword = generateTempPassword();
        chairman.password = await bcrypt.hash(tempPassword, 10);
        chairman.firstLogin = true;
        await chairman.save();

        res.status(200).json({
            success: true,
            message: "Chairman temporary password generated. It must be changed after sign-in.",
            username: chairman.username,
            tempPassword,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    login,
    getMe,
    logout,
    changePassword,
    requestPasswordReset,
    getPasswordResetRequests,
    approvePasswordReset,
    recoverChairmanPassword,
};
