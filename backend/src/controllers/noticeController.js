const Notice = require("../models/Notice");
const NoticeCounter = require("../models/NoticeCounter");
const User = require("../models/User");
const recordActivity = require("../utils/recordActivity");

const getNoticeYear = (date) => Number(new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: "Asia/Kolkata",
}).format(date));

const getNoticeNumber = (role, year, sequence) =>
    `GMCA-KMCA/NOTICE/${role.toUpperCase()}/${year}/${String(sequence).padStart(2, "0")}`;

const serializeNotice = (notice, legacyNumber) => ({
    id: notice._id || notice.id,
    title: notice.title,
    description: notice.description,
    date: notice.createdAt || notice.date,
    noticeNumber: notice.noticeNumber || legacyNumber,
    issuerRole: notice.issuerRole || notice.createdBy?.role || "chairman",
    author: notice.createdBy?.name || null,
});

const getIndiaYearBounds = (year) => ({
    start: new Date(Date.UTC(year, 0, 1) - (5.5 * 60 * 60 * 1000)),
    end: new Date(Date.UTC(year + 1, 0, 1) - (5.5 * 60 * 60 * 1000)),
});

const allocateNoticeNumber = async (role, date) => {
    const year = getNoticeYear(date);
    const { start, end } = getIndiaYearBounds(year);
    const counterFilter = { role, year };
    const counterExists = await NoticeCounter.exists(counterFilter);

    if (!counterExists) {
        const roleUserIds = await User.distinct("_id", { role });
        const existingSequence = await Notice.countDocuments({
            createdAt: { $gte: start, $lt: end },
            $or: [
                { issuerRole: role },
                { issuerRole: { $exists: false }, createdBy: { $in: roleUserIds } },
            ],
        });
        await NoticeCounter.updateOne(
            counterFilter,
            { $setOnInsert: { role, year, sequence: existingSequence } },
            { upsert: true }
        );
    }

    const counter = await NoticeCounter.findOneAndUpdate(
        counterFilter,
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
    );
    return getNoticeNumber(role, year, counter.sequence);
};

const getLegacyNoticeNumbers = (notices) => {
    const counters = new Map();
    const numbers = new Map();
    const chronological = [...notices].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt) || String(a._id).localeCompare(String(b._id))
    );

    chronological.forEach((notice) => {
        const role = notice.issuerRole || notice.createdBy?.role || "chairman";
        const year = getNoticeYear(notice.createdAt);
        const key = `${role}:${year}`;
        let sequence = counters.get(key) || 0;
        const existingNumber = notice.noticeNumber?.match(/\/(\d+)$/);
        if (existingNumber) sequence = Math.max(sequence, Number(existingNumber[1]));
        else sequence += 1;
        counters.set(key, sequence);
        const noticeSequence = existingNumber ? Number(existingNumber[1]) : sequence;
        numbers.set(String(notice._id), getNoticeNumber(role, year, noticeSequence));
    });

    return numbers;
};

const getNotices = async (req, res) => {
    try {
        const requestedLimit = Number.parseInt(req.query.limit, 10);
        const limit = Number.isInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 100)
            : 100;
        const allNotices = await Notice.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name role")
            .lean();
        const legacyNumbers = getLegacyNoticeNumbers(allNotices);
        const notices = allNotices.slice(0, limit);

        res.status(200).json({
            success: true,
            notices: notices.map((notice) => serializeNotice(notice, legacyNumbers.get(String(notice._id)))),
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

        const createdAt = new Date();
        const noticeNumber = await allocateNoticeNumber(req.user.role, createdAt);
        const notice = await Notice.create({
            title,
            description,
            createdBy: req.user._id,
            issuerRole: req.user.role,
            noticeNumber,
            createdAt,
        });
        await notice.populate("createdBy", "name role");
        await recordActivity({
            actor: req.user,
            action: "Published notice",
            target: notice.title,
            details: notice.description,
        });

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

        await recordActivity({
            actor: req.user,
            action: "Deleted notice",
            target: notice.title,
            details: notice.description,
        });

        res.status(200).json({ success: true, message: "Notice deleted successfully" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getNotices, createNotice, deleteNotice };
