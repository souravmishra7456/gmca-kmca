const TeamSelection = require("../models/TeamSelection");
const User = require("../models/User");
const recordActivity = require("../utils/recordActivity");

const toIds = (value) => (Array.isArray(value) ? value.map(String) : []);
const unique = (values) => new Set(values).size === values.length;

const describeSelectionForActivity = async (selection) => {
    const groups = selection.type === "intra"
        ? [["Team A", selection.teamA || []], ["Team B", selection.teamB || []]]
        : [["Playing XI", selection.playingXI || []], ["Substitutes", selection.substitutes || []]];
    const memberIds = [...new Set(groups.flatMap(([, members]) => members.map(String)))];
    const members = await User.find({ _id: { $in: memberIds } }).select("name").lean();
    const namesById = new Map(members.map((member) => [String(member._id), member.name]));
    const selectionSummary = groups
        .map(([label, ids]) => `${label}: ${ids.map((id) => namesById.get(String(id)) || "Unknown member").join(", ")}`)
        .join("; ");

    return `${selection.type === "intra" ? "Intra-match" : "Match squad"} scheduled for ${new Date(selection.matchDate).toLocaleDateString()}. ${selectionSummary}`;
};

const serializeMember = (member) => ({ id: member._id, name: member.name, role: member.role });
const serializeSelection = (selection) => ({
    id: selection._id,
    title: selection.title,
    matchDate: selection.matchDate,
    type: selection.type,
    teamSize: selection.teamSize,
    playingXI: selection.playingXI.map(serializeMember),
    substitutes: selection.substitutes.map(serializeMember),
    captain: selection.captain ? serializeMember(selection.captain) : null,
    teamA: selection.teamA.map(serializeMember),
    teamB: selection.teamB.map(serializeMember),
    teamACaptain: selection.teamACaptain ? serializeMember(selection.teamACaptain) : null,
    teamBCaptain: selection.teamBCaptain ? serializeMember(selection.teamBCaptain) : null,
    announced: selection.announced,
    selectedBy: selection.selectedBy?.name || null,
    createdAt: selection.createdAt,
});

const populateSelection = (query) => query
    .populate("playingXI", "name role")
    .populate("substitutes", "name role")
    .populate("captain", "name role")
    .populate("teamA", "name role")
    .populate("teamB", "name role")
    .populate("teamACaptain", "name role")
    .populate("teamBCaptain", "name role")
    .populate("selectedBy", "name");

const getTeamSelections = async (req, res) => {
    try {
        const selections = await populateSelection(
            TeamSelection.find().sort({ matchDate: -1, createdAt: -1 })
        ).lean();

        res.status(200).json({
            success: true,
            selections: selections.map(serializeSelection),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPublicTeamSelections = async (_req, res) => {
    try {
        const selections = await populateSelection(
            TeamSelection.find({ announced: true }).sort({ matchDate: -1, createdAt: -1 })
        ).lean();
        const publicMember = (member) => member ? { name: member.name, role: member.role } : null;
        const publicMembers = (members = []) => members.map(publicMember);

        res.status(200).json({
            success: true,
            selections: selections.map((selection) => ({
                id: selection._id,
                title: selection.title,
                matchDate: selection.matchDate,
                type: selection.type,
                teamSize: selection.teamSize,
                playingXI: publicMembers(selection.playingXI),
                substitutes: publicMembers(selection.substitutes),
                captain: publicMember(selection.captain),
                teamA: publicMembers(selection.teamA),
                teamB: publicMembers(selection.teamB),
                teamACaptain: publicMember(selection.teamACaptain),
                teamBCaptain: publicMember(selection.teamBCaptain),
                selectedBy: selection.selectedBy?.name || null,
                createdAt: selection.createdAt,
            })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createTeamSelection = async (req, res) => {
    try {
        if (!["chairman", "director"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Only the chairman or director can announce team selections",
            });
        }

        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const matchDate = new Date(req.body.matchDate);
        const type = req.body.type;
        const playingXI = toIds(req.body.playingXI);
        const substitutes = toIds(req.body.substitutes);
        const teamA = toIds(req.body.teamA);
        const teamB = toIds(req.body.teamB);
        const captain = req.body.captain ? String(req.body.captain) : "";
        const teamACaptain = req.body.teamACaptain ? String(req.body.teamACaptain) : "";
        const teamBCaptain = req.body.teamBCaptain ? String(req.body.teamBCaptain) : "";

        if (!title || Number.isNaN(matchDate.getTime()) || !["match", "intra"].includes(type)) {
            return res.status(400).json({ success: false, message: "Title, match date, and selection type are required" });
        }

        if (type === "match") {
            if (!unique(playingXI) || !unique(substitutes)) {
                return res.status(400).json({ success: false, message: "The playing squad and substitutes must not contain duplicate players" });
            }
            if (substitutes.some((memberId) => playingXI.includes(memberId))) {
                return res.status(400).json({ success: false, message: "A substitute cannot also be in the playing XI" });
            }
            if (!captain || !playingXI.includes(captain)) {
                return res.status(400).json({ success: false, message: "Choose a captain from the playing XI" });
            }
        }

        let teamSize;
        if (type === "intra") {
            teamSize = Number(req.body.teamSize);
            if (!Number.isInteger(teamSize) || teamSize < 2 || teamSize > 25) {
                return res.status(400).json({ success: false, message: "Team size must be between 2 and 25" });
            }
            if (teamA.length !== teamSize || teamB.length !== teamSize || !unique(teamA) || !unique(teamB)) {
                return res.status(400).json({ success: false, message: "Each intra-match team must contain the selected number of unique players" });
            }
            if (!teamACaptain || !teamA.includes(teamACaptain) || !teamBCaptain || !teamB.includes(teamBCaptain)) {
                return res.status(400).json({ success: false, message: "Choose a captain from each intra-match team" });
            }
        }

        const memberIds = [...new Set([...playingXI, ...substitutes, ...teamA, ...teamB])];
        const activeMemberCount = await User.countDocuments({ _id: { $in: memberIds }, isActive: true });
        if (activeMemberCount !== memberIds.length) {
            return res.status(400).json({ success: false, message: "One or more selected members are unavailable" });
        }

        const selection = await TeamSelection.create({
            title,
            matchDate,
            type,
            teamSize: type === "intra" ? teamSize : undefined,
            playingXI: type === "match" ? playingXI : [],
            substitutes: type === "match" ? substitutes : [],
            captain: type === "match" ? captain : undefined,
            teamA: type === "intra" ? teamA : [],
            teamB: type === "intra" ? teamB : [],
            teamACaptain: type === "intra" ? teamACaptain : undefined,
            teamBCaptain: type === "intra" ? teamBCaptain : undefined,
            selectedBy: req.user._id,
            announced: true,
        });
        const populatedSelection = await populateSelection(
            TeamSelection.findById(selection._id)
        );
        await recordActivity({
            actor: req.user,
            action: "Announced team selection",
            target: selection.title,
            details: await describeSelectionForActivity(selection),
        });

        res.status(201).json({
            success: true,
            message: "Team selection announced",
            selection: serializeSelection(populatedSelection),
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ success: false, message: "Please select valid members" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTeamSelection = async (req, res) => {
    try {
        if (!["chairman", "director"].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "Only the chairman or director can delete team selections" });
        }

        const selection = await TeamSelection.findByIdAndDelete(req.params.selectionId);
        if (!selection) {
            return res.status(404).json({ success: false, message: "Team selection not found" });
        }

        await recordActivity({
            actor: req.user,
            action: "Deleted team selection",
            target: selection.title,
            details: await describeSelectionForActivity(selection),
        });

        res.status(200).json({ success: true, message: "Team selection deleted" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({ success: false, message: "Team selection not found" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTeamSelections, getPublicTeamSelections, createTeamSelection, deleteTeamSelection };
