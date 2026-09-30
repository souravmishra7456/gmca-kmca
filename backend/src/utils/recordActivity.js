const ActivityLog = require("../models/ActivityLog");

const MAX_ACTIVITY_LOGS = 200;
const PRUNE_EVERY = 10;
let entriesSincePrune = 0;

const pruneOldEntries = async () => {
    const oldestKeptEntry = await ActivityLog.findOne()
        .sort({ createdAt: -1, _id: -1 })
        .skip(MAX_ACTIVITY_LOGS - 1)
        .select("_id createdAt")
        .lean();

    if (!oldestKeptEntry) return;

    await ActivityLog.deleteMany({
        $or: [
            { createdAt: { $lt: oldestKeptEntry.createdAt } },
            {
                createdAt: oldestKeptEntry.createdAt,
                _id: { $lt: oldestKeptEntry._id },
            },
        ],
    });
};

const recordActivity = async ({ actor, action, target, details = "" }) => {
    if (!actor?._id) return;

    try {
        await ActivityLog.create({
            actorId: actor._id,
            actorName: actor.name,
            actorRole: actor.role,
            action,
            target: String(target || "Portal").slice(0, 160),
            details: String(details || "").slice(0, 1000),
        });

        entriesSincePrune += 1;
        if (entriesSincePrune >= PRUNE_EVERY) {
            entriesSincePrune = 0;
            await pruneOldEntries();
        }
    } catch (error) {
        console.error("Unable to record portal activity:", error.message);
    }
};

module.exports = recordActivity;
