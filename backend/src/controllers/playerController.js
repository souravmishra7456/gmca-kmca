const bcrypt = require("bcryptjs");
const User = require("../models/User");
const PlayerStats = require("../models/PlayerStats");
const {
    VALID_ROLES,
    buildUsername,
    resolveUniqueUsername,
    generateTempPassword,
    generateMemberId,
} = require("../utils/playerHelpers");

const createPlayer = async (req, res) => {
    try {
        const { name, role } = req.body;
        const allowedCreationRoles = ["director", "player"];

        if (!name || !role) {
            return res.status(400).json({
                success: false,
                message: "Name and role are required",
            });
        }

        if (!VALID_ROLES.includes(role) || !allowedCreationRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be director or player",
            });
        }

        if (role === "director") {
            const directorExists = await User.exists({
                role: "director",
                isActive: true,
            });

            if (directorExists) {
                return res.status(409).json({
                    success: false,
                    message: "A director has already been created",
                });
            }
        }

        const baseUsername = buildUsername(name);
        const username = await resolveUniqueUsername(User, baseUsername);
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const memberId = await generateMemberId(User);

        const user = await User.create({
            name: name.trim(),
            memberId,
            username,
            password: hashedPassword,
            role,
            firstLogin: true,
            isActive: true,
        });

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                memberId: user.memberId,
                name: user.name,
                role: user.role,
                username: user.username,
            },
            tempPassword,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        if (
            error.message === "Full name must include first and last name" ||
            error.message === "Full name must include valid first and last name"
        ) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getPlayers = async (req, res) => {
    try {
        const players = await User.find({ isActive: true })
            .select("-password")
            .sort({ createdAt: -1 });
        const playerStats = await PlayerStats.find({
            player: { $in: players.map((player) => player._id) },
        }).lean();
        const statsByPlayer = new Map(
            playerStats.map((stats) => [String(stats.player), stats])
        );

        res.status(200).json({
            success: true,
            players: players.map((user) => ({
                id: user._id,
                memberId: user.memberId,
                name: user.name,
                role: user.role,
                username: user.username,
                status: user.isActive ? "active" : "inactive",
                playerProfile: user.playerProfile,
                statistics: statsByPlayer.get(String(user._id)) || null,
            })),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const statFields = [
    "matches", "innings", "runs", "balls",
    "wickets", "economy", "highestScore", "bestFigures",
];
const wholeNumberFields = ["matches", "innings", "runs", "balls", "wickets", "highestScore"];

const validateStatistics = (statistics) => {
    for (const field of statFields) {
        if (statistics[field] === undefined || statistics[field] === null || statistics[field] === "") {
            return `${field} is required`;
        }
    }

    for (const field of wholeNumberFields) {
        if (!Number.isInteger(statistics[field]) || statistics[field] < 0) {
            return `${field} must be a non-negative whole number`;
        }
    }

    for (const field of ["strikeRate", "average", "economy"]) {
        if (typeof statistics[field] !== "number" || !Number.isFinite(statistics[field]) || statistics[field] < 0) {
            return `${field} must be a non-negative number`;
        }
    }

    if (statistics.highestScore > statistics.runs) {
        return "Highest score cannot be greater than total runs";
    }

    if (!/^\d{1,2}\/\d{1,3}$/.test(statistics.bestFigures)) {
        return "Best figures must use wickets/runs, e.g. 4/21";
    }

    const bestFigureWickets = Number(statistics.bestFigures.split("/")[0]);
    if (bestFigureWickets > statistics.wickets) {
        return "Best-figures wickets cannot be greater than total wickets";
    }

    return null;
};

const roundToTwoDecimals = (value) => Math.round(value * 100) / 100;

const calculateBattingRates = ({ runs, balls, innings }) => ({
    strikeRate: balls > 0 ? roundToTwoDecimals((runs / balls) * 100) : 0,
    average: innings > 0 ? roundToTwoDecimals(runs / innings) : 0,
});

const updatePlayerStats = async (req, res) => {
    try {
        const { updatedBy, strikeRate, average, ...statistics } = req.body;
        if (!updatedBy) {
            return res.status(400).json({ success: false, message: "Updated-by user is required" });
        }
        const validationError = validateStatistics(statistics);

        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const editor = await User.findOne({ _id: updatedBy, isActive: true }).select("role");
        if (!editor || !["chairman", "director"].includes(editor.role)) {
            return res.status(403).json({
                success: false,
                message: "Only the chairman or director can update player statistics",
            });
        }

        const player = await User.findOne({
            _id: req.params.playerId,
            role: { $in: ["player", "chairman", "director"] },
            isActive: true,
        });
        if (!player) {
            return res.status(404).json({ success: false, message: "Member not found" });
        }

        const savedStats = await PlayerStats.findOneAndUpdate(
            { player: player._id },
            {
                $set: {
                    ...statistics,
                    ...calculateBattingRates(statistics),
                    updatedBy: editor._id,
                },
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            message: "Player statistics saved successfully",
            statistics: savedStats,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ success: false, message: "Player not found" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePlayerProfile = async (req, res) => {
    try {
        const { dateOfBirth, birthPlace, battingStyle, bowlingStyle } = req.body;
        const profile = { dateOfBirth, birthPlace, battingStyle, bowlingStyle };

        if (Object.values(profile).some((value) => typeof value !== "string" || !value.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please complete all personal detail fields",
            });
        }

        const player = await User.findOne({
            _id: req.params.playerId,
            isActive: true,
        });

        if (!player) {
            return res.status(404).json({
                success: false,
                message: "Player not found",
            });
        }

        player.playerProfile = Object.fromEntries(
            Object.entries(profile).map(([key, value]) => [key, value.trim()])
        );
        await player.save();

        res.status(200).json({
            success: true,
            message: "Personal details saved successfully",
            playerProfile: player.playerProfile,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ success: false, message: "Player not found" });
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createPlayer,
    getPlayers,
    updatePlayerProfile,
    updatePlayerStats,
};
