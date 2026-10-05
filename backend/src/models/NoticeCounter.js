const mongoose = require("mongoose");

const noticeCounterSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["chairman", "director"],
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        sequence: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    { timestamps: true }
);

noticeCounterSchema.index({ role: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("NoticeCounter", noticeCounterSchema);
