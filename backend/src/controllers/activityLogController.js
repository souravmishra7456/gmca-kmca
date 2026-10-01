const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");

const getActivityLogs = async (req, res) => {
    try {
        if (req.user.role !== "chairman") {
            return res.status(403).json({
                success: false,
                message: "Only the chairman can view portal activity",
            });
        }

        const entries = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();

        res.status(200).json({
            success: true,
            entries: entries.map((entry) => ({
                id: entry._id,
                actorName: entry.actorName,
                actorRole: entry.actorRole,
                action: entry.action,
                target: entry.target,
                details: entry.details,
                createdAt: entry.createdAt,
            })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteActivityLog = async (req, res) => {
    try {
        if (req.user.role !== "chairman") {
            return res.status(403).json({
                success: false,
                message: "Only the chairman can delete portal activity",
            });
        }

        if (!mongoose.isValidObjectId(req.params.activityId)) {
            return res.status(404).json({ success: false, message: "Activity entry not found" });
        }

        const deletedEntry = await ActivityLog.findByIdAndDelete(req.params.activityId);
        if (!deletedEntry) {
            return res.status(404).json({ success: false, message: "Activity entry not found" });
        }

        res.status(200).json({ success: true, message: "Activity entry deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteActivityLogs = async (req, res) => {
    try {
        if (req.user.role !== "chairman") {
            return res.status(403).json({
                success: false,
                message: "Only the chairman can delete portal activity",
            });
        }

        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200 || ids.some((id) => !mongoose.isValidObjectId(id))) {
            return res.status(400).json({ success: false, message: "Select between 1 and 200 valid activity entries." });
        }

        const result = await ActivityLog.deleteMany({ _id: { $in: ids } });
        return res.status(200).json({
            success: true,
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} activity entries deleted`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getActivityLogs, deleteActivityLog, deleteActivityLogs };
