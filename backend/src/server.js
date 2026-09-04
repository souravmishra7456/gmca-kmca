require("dotenv").config();

const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await seedAdmin();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});
