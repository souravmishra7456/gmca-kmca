const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        actorName: { type: String, required: true, trim: true },
        actorRole: { type: String, required: true, trim: true },
        action: { type: String, required: true, trim: true },
        target: { type: String, required: true, trim: true },
        details: { type: String, trim: true, maxlength: 1000, default: "" },
    },
    { timestamps: true }
);

activityLogSchema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
