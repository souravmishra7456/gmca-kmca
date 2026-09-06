const User = require("../models/User");
const { getSession } = require("../utils/sessionStore");

const authMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId;

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }

        const session = getSession(sessionId);
        if (!session) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const user = await User.findById(session.userId).select("-password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated",
        });
    }
};

module.exports = authMiddleware;
