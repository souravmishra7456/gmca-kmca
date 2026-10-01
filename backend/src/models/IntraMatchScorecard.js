const mongoose = require("mongoose");

const batterLineSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    dismissed: { type: Boolean, default: false },
}, { _id: false });

const bowlerLineSchema = new mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    balls: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
}, { _id: false });

const deliverySchema = new mongoose.Schema({
    batter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bowler: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batterRuns: { type: Number, min: 0, max: 6, default: 0 },
    extra: { type: String, enum: ["none", "wide", "no-ball", "bye", "leg-bye"], default: "none" },
    extraRuns: { type: Number, min: 0, max: 6, default: 0 },
    wicket: { type: Boolean, default: false },
    dismissal: { type: String, enum: ["bowled", "caught", "lbw", "stumped", "run-out", "other"] },
    legal: { type: Boolean, required: true },
    strikerBefore: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nonStrikerBefore: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dismissedPlayer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    incomingBatter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const inningsSchema = new mongoose.Schema({
    battingTeam: { type: String, enum: ["A", "B"], required: true },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    legalBalls: { type: Number, default: 0 },
    striker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nonStriker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    currentBowler: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    awaitingNextBowler: { type: Boolean, default: false },
    batters: [batterLineSchema],
    bowlers: [bowlerLineSchema],
    deliveries: [deliverySchema],
    status: { type: String, enum: ["live", "complete"], default: "live" },
}, { timestamps: true });

const scorecardSchema = new mongoose.Schema({
    selection: { type: mongoose.Schema.Types.ObjectId, ref: "TeamSelection", required: true, unique: true },
    oversLimit: { type: Number, required: true, min: 1, max: 50 },
    battingMode: { type: String, enum: ["standard", "fixed", "over"], default: "standard" },
    wicketEndMode: { type: String, enum: ["all-out", "second-last"], default: "all-out" },
    status: { type: String, enum: ["live", "innings-break", "completed"], default: "live" },
    innings: { type: [inningsSchema], default: [] },
    statsApplied: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("IntraMatchScorecard", scorecardSchema);
