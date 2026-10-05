const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 140,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        issuerRole: {
            type: String,
            enum: ["chairman", "director"],
        },
        noticeNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
