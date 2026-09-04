const User = require("../models/User");
const PlayerStats = require("../models/PlayerStats");

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

module.exports = { getAssociationStats };
