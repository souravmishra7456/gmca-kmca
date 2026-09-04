const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: String,

        memberId: {
            type: String,
            unique: true,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["chairman", "director", "player"],
            default: "player",
        },

        firstLogin: {
            type: Boolean,
            default: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        playerProfile: {
            dateOfBirth: { type: String, trim: true },
            birthPlace: { type: String, trim: true },
            battingStyle: { type: String, trim: true },
            bowlingStyle: { type: String, trim: true },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
