const bcrypt = require("bcryptjs");
const User = require("../models/User");

const isBcryptHash = (value) => /^\$2[aby]\$/.test(value);

const migrateUsers = async () => {
    const users = await User.find({});

    for (const user of users) {
        let updated = false;

        if (!isBcryptHash(user.password)) {
            user.password = await bcrypt.hash(user.password, 10);
            updated = true;
        }

        if (!user.memberId) {
            user.memberId = `GMCA${String(user._id).slice(-6).toUpperCase()}`;
            updated = true;
        }

        if (updated) {
            await user.save();
            console.log(`Migrated user: ${user.username}`);
        }
    }
};

const seedAdmin = async () => {
    await migrateUsers();

    const userCount = await User.countDocuments();

    if (userCount > 0) {
        return;
    }

    const username = process.env.ADMIN_USERNAME || "chairman";
    const password = process.env.ADMIN_PASSWORD || "chairman123";
    const memberId = process.env.ADMIN_MEMBER_ID || "GMCA001";
    const name = process.env.ADMIN_NAME || "Chairman";

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        name,
        memberId,
        username,
        password: hashedPassword,
        role: "chairman",
        firstLogin: true,
        isActive: true,
    });

    console.log(`Default admin user created (username: ${username})`);
};

module.exports = seedAdmin;
