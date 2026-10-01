const TeamSelection = require("../models/TeamSelection");
const IntraMatchScorecard = require("../models/IntraMatchScorecard");
const PlayerStats = require("../models/PlayerStats");
const recordActivity = require("../utils/recordActivity");

const managerOnly = (req, res) => {
    if (!["chairman", "director"].includes(req.user?.role)) {
        res.status(403).json({ success: false, message: "Only the chairman or director can manage intra-match scoring" });
        return false;
    }
    return true;
};
const teamIds = (selection, team) => (team === "A" ? selection.teamA : selection.teamB).map(String);
const line = (rows, id) => rows.find((row) => String(row.player) === String(id));
const ensureLine = (rows, id) => line(rows, id) || rows[rows.push({ player: id }) - 1];
const otherTeam = (team) => team === "A" ? "B" : "A";

const attachNames = async (scorecard) => {
    await scorecard.populate([
        { path: "selection", populate: [
            { path: "teamA", select: "name role" }, { path: "teamB", select: "name role" },
        ] },
        { path: "innings.striker", select: "name" }, { path: "innings.nonStriker", select: "name" },
        { path: "innings.currentBowler", select: "name" }, { path: "innings.batters.player", select: "name" },
        { path: "innings.bowlers.player", select: "name" }, { path: "innings.deliveries.batter", select: "name" },
        { path: "innings.deliveries.bowler", select: "name" }, { path: "innings.deliveries.dismissedPlayer", select: "name" },
    ]);
    return scorecard;
};

const getScorecard = async (req, res) => {
    try {
        if (!managerOnly(req, res)) return;
        const selection = await TeamSelection.findOne({ _id: req.params.selectionId, type: "intra" })
            .populate("teamA", "name role").populate("teamB", "name role").lean();
        if (!selection) return res.status(404).json({ success: false, message: "Intra-match selection not found" });
        const scorecard = await IntraMatchScorecard.findOne({ selection: selection._id });
        if (scorecard) await attachNames(scorecard);
        res.json({ success: true, selection, scorecard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPublicScorecard = async (req, res) => {
    try {
        const selection = await TeamSelection.findOne({ _id: req.params.selectionId, type: "intra", announced: true })
            .select("title matchDate teamSize teamA teamB")
            .populate("teamA", "name").populate("teamB", "name").lean();
        if (!selection) return res.status(404).json({ success: false, message: "Published intra-match not found" });
        const scorecard = await IntraMatchScorecard.findOne({ selection: selection._id });
        if (!scorecard) return res.status(404).json({ success: false, message: "Scorecard is not available yet" });
        await attachNames(scorecard);
        const member = (player) => player ? { id: String(player._id || player), name: player.name || "Player" } : null;
        const maidensByBowler = (deliveries) => {
            let legalBallCount = 0;
            const overs = new Map();
            for (const delivery of deliveries) {
                const overNumber = Math.floor(legalBallCount / 6);
                const bowlerId = String(delivery.bowler?._id || delivery.bowler);
                const key = `${overNumber}:${bowlerId}`;
                const summary = overs.get(key) || { bowlerId, legalBalls: 0, runs: 0 };
                summary.runs += delivery.batterRuns + (["wide", "no-ball"].includes(delivery.extra) ? delivery.extraRuns : 0);
                if (delivery.legal) { summary.legalBalls += 1; legalBallCount += 1; }
                overs.set(key, summary);
            }
            return [...overs.values()].reduce((result, over) => {
                if (over.legalBalls === 6 && over.runs === 0) result.set(over.bowlerId, (result.get(over.bowlerId) || 0) + 1);
                return result;
            }, new Map());
        };
        res.json({
            success: true,
            selection: { id: String(selection._id), title: selection.title, matchDate: selection.matchDate, teamSize: selection.teamSize },
            teams: {
                A: selection.teamA.map((player) => ({ id: String(player._id), name: player.name })),
                B: selection.teamB.map((player) => ({ id: String(player._id), name: player.name })),
            },
            scorecard: {
                status: scorecard.status,
                oversLimit: scorecard.oversLimit,
                statsApplied: scorecard.statsApplied,
                innings: scorecard.innings.map((innings) => ({
                    battingTeam: innings.battingTeam,
                    runs: innings.runs,
                    wickets: innings.wickets,
                    legalBalls: innings.legalBalls,
                    extras: innings.deliveries.reduce((summary, delivery) => {
                        summary.total += delivery.extraRuns;
                        if (delivery.extra === "wide") summary.wides += delivery.extraRuns;
                        if (delivery.extra === "no-ball") summary.noBalls += delivery.extraRuns;
                        if (delivery.extra === "bye") summary.byes += delivery.extraRuns;
                        if (delivery.extra === "leg-bye") summary.legByes += delivery.extraRuns;
                        return summary;
                    }, { total: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 }),
                    batters: innings.batters.map((row) => {
                        const dismissal = row.dismissedPlayer || innings.deliveries.find((delivery) => String(delivery.dismissedPlayer?._id || delivery.dismissedPlayer) === String(row.player?._id || row.player));
                        const dismissalType = dismissal?.dismissal || "";
                        const dismissalBowler = dismissal?.bowler?.name || "";
                        return ({
                        player: member(row.player), runs: row.runs, balls: row.balls,
                        fours: row.fours, sixes: row.sixes, dismissed: row.dismissed,
                        dismissal: row.dismissed ? `${dismissalType}${dismissalBowler ? ` b ${dismissalBowler}` : ""}` : "not out",
                    }); }),
                    bowlers: innings.bowlers.map((row) => ({
                        player: member(row.player), balls: row.balls, maidens: maidensByBowler(innings.deliveries).get(String(row.player?._id || row.player)) || 0, runs: row.runs, wickets: row.wickets,
                    })),
                })),
            },
        });
    } catch (error) {
        if (error.name === "CastError") return res.status(404).json({ success: false, message: "Published intra-match not found" });
        res.status(500).json({ success: false, message: error.message });
    }
};

const startMatch = async (req, res) => {
    try {
        if (!managerOnly(req, res)) return;
        const selection = await TeamSelection.findOne({ _id: req.params.selectionId, type: "intra" });
        if (!selection) return res.status(404).json({ success: false, message: "Intra-match selection not found" });
        const existing = await IntraMatchScorecard.findOne({ selection: selection._id });
        if (existing) return res.status(409).json({ success: false, message: "Scoring has already been started for this match" });
        const { oversLimit, battingTeam, striker, nonStriker, bowler } = req.body;
        const battingMode = req.body.battingMode || "standard";
        const wicketEndMode = req.body.wicketEndMode || "all-out";
        const overs = Number(oversLimit);
        if (!Number.isInteger(overs) || overs < 1 || overs > 50 || !["A", "B"].includes(battingTeam) || !["standard", "fixed", "over"].includes(battingMode) || !["all-out", "second-last"].includes(wicketEndMode)) {
            return res.status(400).json({ success: false, message: "Choose valid match scoring rules and an over limit from 1 to 50" });
        }
        const batting = teamIds(selection, battingTeam);
        const bowling = teamIds(selection, otherTeam(battingTeam));
        if (!batting.includes(String(striker)) || !batting.includes(String(nonStriker)) || striker === nonStriker || !bowling.includes(String(bowler))) {
            return res.status(400).json({ success: false, message: "Choose two different opening batters and a bowler from the opposing team" });
        }
        const scorecard = await IntraMatchScorecard.create({
            selection: selection._id, oversLimit: overs, battingMode, wicketEndMode, updatedBy: req.user._id,
            innings: [{ battingTeam, striker, nonStriker, currentBowler: bowler,
                batters: [{ player: striker }, { player: nonStriker }], bowlers: [{ player: bowler }] }],
        });
        await attachNames(scorecard);
        await recordActivity({ actor: req.user, action: "Started intra-match scoring", target: selection.title, details: `${overs} overs per innings.` });
        res.status(201).json({ success: true, scorecard });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ success: false, message: "Scoring has already been started for this match" });
        res.status(500).json({ success: false, message: error.message });
    }
};

const recordDelivery = async (req, res) => {
    try {
        if (!managerOnly(req, res)) return;
        const scorecard = await IntraMatchScorecard.findOne({ selection: req.params.selectionId });
        if (!scorecard || scorecard.status !== "live") return res.status(409).json({ success: false, message: "This innings is not live" });
        const innings = scorecard.innings[scorecard.innings.length - 1];
        if (innings.status !== "live") return res.status(409).json({ success: false, message: "This innings has ended" });
        if (innings.awaitingNextBowler) return res.status(409).json({ success: false, message: "Set the bowler for the next over first" });
        const selection = await TeamSelection.findById(scorecard.selection);
        const batting = teamIds(selection, innings.battingTeam);
        const bowling = teamIds(selection, otherTeam(innings.battingTeam));
        const { batterRuns = 0, extra = "none", extraRuns = 0, wicket = false, dismissal, newBatter, dismissedPlayer: requestedDismissedPlayer } = req.body;
        const runs = Number(batterRuns), extras = Number(extraRuns);
        if (!Number.isInteger(runs) || runs < 0 || runs > 6 || !Number.isInteger(extras) || extras < 0 || extras > 6 || !["none", "wide", "no-ball", "bye", "leg-bye"].includes(extra)) {
            return res.status(400).json({ success: false, message: "Invalid runs or extra type" });
        }
        if (extra === "none" && extras !== 0) return res.status(400).json({ success: false, message: "Extra runs require an extra type" });
        if (["wide", "no-ball"].includes(extra) && extras < 1) return res.status(400).json({ success: false, message: "A wide or no-ball must add at least one extra run" });
        if (!batting.includes(String(innings.striker)) || !bowling.includes(String(innings.currentBowler))) return res.status(409).json({ success: false, message: "The active players are no longer in this match" });
        const dismissalTypes = ["bowled", "caught", "lbw", "stumped", "run-out", "other"];
        if (wicket && !dismissalTypes.includes(dismissal)) return res.status(400).json({ success: false, message: "Choose a dismissal type" });
        const nextWickets = innings.wickets + (wicket ? 1 : 0);
        const wicketLimit = scorecard.wicketEndMode === "second-last" ? Math.max(1, batting.length - 2) : batting.length - 1;
        const inningsEndsAtThisWicket = nextWickets >= wicketLimit;
        if (wicket && !inningsEndsAtThisWicket && (!batting.includes(String(newBatter)) || [String(innings.striker), String(innings.nonStriker)].includes(String(newBatter)) || innings.batters.some((b) => String(b.player) === String(newBatter) && b.dismissed))) {
            return res.status(400).json({ success: false, message: "Choose an available batter from the batting team" });
        }
        const legal = !["wide", "no-ball"].includes(extra);
        const total = runs + extras;
        const strikerBefore = innings.striker, nonStrikerBefore = innings.nonStriker;
        const batter = ensureLine(innings.batters, innings.striker);
        const bowler = ensureLine(innings.bowlers, innings.currentBowler);
        innings.runs += total;
        batter.runs += runs;
        if (extra !== "wide") batter.balls += 1;
        if (runs === 4 && extra !== "wide") batter.fours += 1;
        if (runs === 6 && extra !== "wide") batter.sixes += 1;
        bowler.runs += runs + (["wide", "no-ball"].includes(extra) ? extras : 0);
        if (legal) { innings.legalBalls += 1; bowler.balls += 1; }
        let dismissedPlayer;
        if (wicket) {
            innings.wickets += 1;
            const dismissedId = requestedDismissedPlayer || (extra === "wide" ? innings.nonStriker : innings.striker);
            if (![String(innings.striker), String(innings.nonStriker)].includes(String(dismissedId))) return res.status(400).json({ success: false, message: "Choose a batter currently at the crease" });
            dismissedPlayer = dismissedId;
            ensureLine(innings.batters, dismissedId).dismissed = true;
            const credited = ["bowled", "caught", "lbw", "stumped"].includes(dismissal) && extra !== "wide";
            if (credited) bowler.wickets += 1;
            if (!inningsEndsAtThisWicket) {
                if (String(dismissedId) === String(innings.striker)) innings.striker = newBatter;
                else innings.nonStriker = newBatter;
                ensureLine(innings.batters, newBatter);
            }
        }
        innings.deliveries.push({ batter: batter.player, bowler: bowler.player, batterRuns: runs, extra, extraRuns: extras, wicket, dismissal: wicket ? dismissal : undefined, legal, strikerBefore, nonStrikerBefore, dismissedPlayer, incomingBatter: wicket && !inningsEndsAtThisWicket ? newBatter : undefined });
        if (scorecard.battingMode === "standard" && total % 2 === 1) [innings.striker, innings.nonStriker] = [innings.nonStriker, innings.striker];
        if (scorecard.battingMode !== "fixed" && legal && innings.legalBalls % 6 === 0) [innings.striker, innings.nonStriker] = [innings.nonStriker, innings.striker];
        if (innings.legalBalls >= scorecard.oversLimit * 6 || innings.wickets >= wicketLimit) innings.status = "complete";
        const firstInnings = scorecard.innings[0];
        if (scorecard.innings.length === 2 && innings.runs > firstInnings.runs) innings.status = "complete";
        innings.awaitingNextBowler = innings.status === "live" && innings.legalBalls > 0 && innings.legalBalls % 6 === 0;
        if (innings.status === "complete") scorecard.status = scorecard.innings.length === 1 ? "innings-break" : "completed";
        scorecard.updatedBy = req.user._id;
        await scorecard.save();
        await attachNames(scorecard);
        res.json({ success: true, scorecard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const undoDelivery = async (req, res) => {
    try {
        if (!managerOnly(req, res)) return;
        const scorecard = await IntraMatchScorecard.findOne({ selection: req.params.selectionId });
        if (!scorecard || scorecard.statsApplied) return res.status(409).json({ success: false, message: "This scorecard cannot be changed" });
        const innings = scorecard.innings[scorecard.innings.length - 1];
        const delivery = innings.deliveries.pop();
        if (!delivery) return res.status(400).json({ success: false, message: "There is no delivery to undo" });
        const batter = line(innings.batters, delivery.batter);
        const bowler = line(innings.bowlers, delivery.bowler);
        innings.runs -= delivery.batterRuns + delivery.extraRuns;
        batter.runs -= delivery.batterRuns;
        if (delivery.extra !== "wide") batter.balls -= 1;
        if (delivery.batterRuns === 4 && delivery.extra !== "wide") batter.fours -= 1;
        if (delivery.batterRuns === 6 && delivery.extra !== "wide") batter.sixes -= 1;
        bowler.runs -= delivery.batterRuns + (["wide", "no-ball"].includes(delivery.extra) ? delivery.extraRuns : 0);
        if (delivery.legal) { innings.legalBalls -= 1; bowler.balls -= 1; }
        if (delivery.wicket) {
            innings.wickets -= 1;
            const dismissed = line(innings.batters, delivery.dismissedPlayer);
            if (dismissed) dismissed.dismissed = false;
            if (["bowled", "caught", "lbw", "stumped"].includes(delivery.dismissal) && delivery.extra !== "wide") bowler.wickets -= 1;
        }
        innings.striker = delivery.strikerBefore;
        innings.nonStriker = delivery.nonStrikerBefore;
        innings.status = "live";
        innings.awaitingNextBowler = false;
        scorecard.status = "live";
        await scorecard.save();
        await attachNames(scorecard);
        res.json({ success: true, scorecard });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const startSecondInnings = async (req, res) => {
    try {
        if (!managerOnly(req, res)) return;
        const scorecard = await IntraMatchScorecard.findOne({ selection: req.params.selectionId });
        if (!scorecard || scorecard.status !== "innings-break" || scorecard.innings.length !== 1) return res.status(409).json({ success: false, message: "The first innings is not complete" });
        const selection = await TeamSelection.findById(scorecard.selection);
        const battingTeam = otherTeam(scorecard.innings[0].battingTeam);
        const batting = teamIds(selection, battingTeam), bowling = teamIds(selection, otherTeam(battingTeam));
        const { striker, nonStriker, bowler } = req.body;
        if (!batting.includes(String(striker)) || !batting.includes(String(nonStriker)) || striker === nonStriker || !bowling.includes(String(bowler))) return res.status(400).json({ success: false, message: "Choose two opening batters and an opposing bowler" });
        scorecard.innings.push({ battingTeam, striker, nonStriker, currentBowler: bowler,
            batters: [{ player: striker }, { player: nonStriker }], bowlers: [{ player: bowler }] });
        scorecard.status = "live";
        scorecard.updatedBy = req.user._id;
        await scorecard.save();
        await attachNames(scorecard);
        res.json({ success: true, scorecard });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const changeBowler = async (req, res) => {
    try {
        if (!managerOnly(req, res)) return;
        const scorecard = await IntraMatchScorecard.findOne({ selection: req.params.selectionId, status: "live" });
        if (!scorecard) return res.status(404).json({ success: false, message: "Live scorecard not found" });
        const innings = scorecard.innings[scorecard.innings.length - 1];
        if (!innings.awaitingNextBowler) return res.status(409).json({ success: false, message: "Change the bowler at the end of an over" });
        const selection = await TeamSelection.findById(scorecard.selection);
        if (!teamIds(selection, otherTeam(innings.battingTeam)).includes(String(req.body.bowler))) return res.status(400).json({ success: false, message: "Choose a bowler from the fielding team" });
        innings.currentBowler = req.body.bowler;
        innings.awaitingNextBowler = false;
        ensureLine(innings.bowlers, req.body.bowler);
        scorecard.updatedBy = req.user._id;
        await scorecard.save();
        await attachNames(scorecard);
        res.json({ success: true, scorecard });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const finalizeMatch = async (req, res) => {
    try {
        if (!managerOnly(req, res)) return;
        const scorecard = await IntraMatchScorecard.findOne({ selection: req.params.selectionId });
        if (!scorecard || scorecard.innings.length !== 2 || scorecard.innings.some((innings) => innings.status !== "complete")) return res.status(409).json({ success: false, message: "Both innings must be complete before finalizing" });
        if (scorecard.statsApplied) return res.status(409).json({ success: false, message: "Player statistics have already been updated for this match" });
        const selection = await TeamSelection.findById(scorecard.selection);
        const playerIds = [...new Set([...teamIds(selection, "A"), ...teamIds(selection, "B")])];
        for (const playerId of playerIds) {
            let stats = await PlayerStats.findOne({ player: playerId });
            if (!stats) stats = new PlayerStats({ player: playerId, matches: 0, innings: 0, runs: 0, balls: 0, strikeRate: 0, average: 0, wickets: 0, economy: 0, highestScore: 0, bestFigures: "0/0", updatedBy: req.user._id });
            if ((stats.appliedMatches || []).some((id) => String(id) === String(scorecard._id))) continue;
            const battingRows = scorecard.innings.flatMap((innings) => innings.batters.filter((row) => String(row.player) === playerId));
            const bowlingRows = scorecard.innings.flatMap((innings) => innings.bowlers.filter((row) => String(row.player) === playerId));
            const matchRuns = battingRows.reduce((sum, row) => sum + row.runs, 0);
            const matchBalls = battingRows.reduce((sum, row) => sum + row.balls, 0);
            const matchWickets = bowlingRows.reduce((sum, row) => sum + row.wickets, 0);
            stats.matches += 1;
            stats.innings += battingRows.filter((row) => row.balls > 0 || row.runs > 0 || row.dismissed).length;
            stats.runs += matchRuns;
            stats.balls += matchBalls;
            stats.wickets += matchWickets;
            stats.highestScore = Math.max(stats.highestScore, ...battingRows.map((row) => row.runs));
            stats.strikeRate = stats.balls > 0 ? Math.round((stats.runs / stats.balls) * 10000) / 100 : 0;
            stats.average = stats.innings > 0 ? Math.round((stats.runs / stats.innings) * 100) / 100 : 0;
            // Existing career records do not store conceded runs/overs cumulatively,
            // so leave economy unchanged instead of deriving an inaccurate value.
            const currentBest = stats.bestFigures.split("/").map(Number);
            const matchBest = bowlingRows.reduce((best, row) => row.wickets > best.wickets || (row.wickets === best.wickets && row.runs < best.runs) ? row : best, { wickets: 0, runs: Infinity });
            if (matchBest.wickets > currentBest[0] || (matchBest.wickets === currentBest[0] && matchBest.wickets > 0 && matchBest.runs < currentBest[1])) stats.bestFigures = `${matchBest.wickets}/${matchBest.runs}`;
            stats.updatedBy = req.user._id;
            stats.appliedMatches = [...(stats.appliedMatches || []), scorecard._id];
            await stats.save();
        }
        scorecard.status = "completed";
        scorecard.statsApplied = true;
        scorecard.updatedBy = req.user._id;
        await scorecard.save();
        await recordActivity({ actor: req.user, action: "Finalized intra-match scorecard", target: selection.title, details: "Updated player match, batting, and wicket statistics." });
        await attachNames(scorecard);
        res.json({ success: true, message: "Match finalized and player statistics updated", scorecard });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { getScorecard, getPublicScorecard, startMatch, recordDelivery, undoDelivery, startSecondInnings, changeBowler, finalizeMatch };
