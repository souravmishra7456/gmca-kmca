const User = require("../models/User");
const PlayerStats = require("../models/PlayerStats");
const TeamSelection = require("../models/TeamSelection");

const getAssociationStats = async (req, res) => {
    try {
        const activeMemberIds = await User.find({ isActive: true }).distinct("_id");
        const [totals] = await PlayerStats.aggregate([
            { $match: { player: { $in: activeMemberIds } } },
            {
                $group: {
                    _id: null,
                    matches: { $sum: "$matches" },
                    runs: { $sum: "$runs" },
                    wickets: { $sum: "$wickets" },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalMembers: activeMemberIds.length,
                matchesPlayed: totals?.matches || 0,
                totalRuns: totals?.runs || 0,
                totalWickets: totals?.wickets || 0,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getMyUpcomingSelection = async (req, res) => {
    try {
        const memberId = req.user._id;
        const selection = await TeamSelection.findOne({
            announced: true,
            $or: [
                { playingXI: memberId },
                { substitutes: memberId },
                { teamA: memberId },
                { teamB: memberId },
            ],
        })
            .sort({ matchDate: -1, createdAt: -1 })
            .select("title matchDate type playingXI substitutes teamA teamB")
            .lean();

        if (!selection) {
            return res.status(200).json({ success: true, selection: null });
        }

        const isMember = (members) => members.some((id) => String(id) === String(memberId));
        const assignments = [];
        if (isMember(selection.playingXI)) assignments.push("Playing XI");
        if (isMember(selection.substitutes)) assignments.push("Substitute");
        if (isMember(selection.teamA)) assignments.push("Team A");
        if (isMember(selection.teamB)) assignments.push("Team B");

        res.status(200).json({
            success: true,
            selection: {
                id: selection._id,
                title: selection.title,
                matchDate: selection.matchDate,
                type: selection.type,
                assignments,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAssociationStats, getMyUpcomingSelection };
