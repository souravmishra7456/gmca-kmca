const mongoose = require("mongoose");

const integer = {
    type: Number,
    required: true,
    min: 0,
    validate: {
        validator: Number.isInteger,
        message: "Value must be a whole number",
    },
};

const decimal = {
    type: Number,
    required: true,
    min: 0,
};

const playerStatsSchema = new mongoose.Schema(
    {
        player: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        matches: integer,
        innings: integer,
        runs: integer,
        balls: integer,
        strikeRate: decimal,
        average: decimal,
        wickets: integer,
        economy: decimal,
        highestScore: integer,
        bestFigures: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{1,2}\/\d{1,3}$/, "Best figures must use wickets/runs, e.g. 4/21"],
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PlayerStats", playerStatsSchema);
