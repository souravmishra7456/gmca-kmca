const mongoose = require("mongoose");

const teamSelectionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 140 },
        matchDate: { type: Date, required: true },
        type: { type: String, enum: ["match", "intra"], required: true },
        teamSize: { type: Number, min: 2, max: 25 },
        playingXI: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        substitutes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        captain: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        teamA: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        teamB: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        teamACaptain: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        teamBCaptain: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        announced: { type: Boolean, default: true },
        selectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TeamSelection", teamSelectionSchema);
