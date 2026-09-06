const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { createSession, deleteSession, SESSION_DURATION_MS } = require("../utils/sessionStore");

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
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "User, current password, and new password are required",
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

        const user = await User.findById(userId);

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

module.exports = {
    login,
    getMe,
    logout,
    changePassword,
};
