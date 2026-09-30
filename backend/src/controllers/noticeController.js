const Notice = require("../models/Notice");

const serializeNotice = (notice) => ({
    id: notice._id,
    title: notice.title,
    description: notice.description,
    date: notice.createdAt,
    author: notice.createdBy?.name || null,
});

const getNotices = async (req, res) => {
    try {
        const requestedLimit = Number.parseInt(req.query.limit, 10);
        const limit = Number.isInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 100)
            : 100;
        const notices = await Notice.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("createdBy", "name")
            .lean();

        res.status(200).json({
            success: true,
            notices: notices.map(serializeNotice),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createNotice = async (req, res) => {
    try {
        if (!req.user || !["chairman", "director"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Only the chairman or director can send notices",
            });
        }

        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const description = typeof req.body.description === "string"
            ? req.body.description.trim()
            : "";

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "A notice title and message are required",
            });
        }

        const notice = await Notice.create({
            title,
            description,
            createdBy: req.user._id,
        });
        await notice.populate("createdBy", "name");

        res.status(201).json({
            success: true,
            message: "Notice sent to all members",
            notice: serializeNotice(notice),
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteNotice = async (req, res) => {
    try {
        if (!req.user || !["chairman", "director"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Only the chairman or director can delete notices",
            });
        }

        const notice = await Notice.findByIdAndDelete(req.params.noticeId);
        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }

        res.status(200).json({ success: true, message: "Notice deleted successfully" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getNotices, createNotice, deleteNotice };
