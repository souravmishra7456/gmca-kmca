const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const playerRoutes = require("./routes/playerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const teamSelectionRoutes = require("./routes/teamSelectionRoutes");
const intraMatchScorerRoutes = require("./routes/intraMatchScorerRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "GMCA-KMCA API Running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/team-selections", teamSelectionRoutes);
app.use("/api/intra-match-scorer", intraMatchScorerRoutes);
app.use("/api/activity-logs", activityLogRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});

module.exports = app;
