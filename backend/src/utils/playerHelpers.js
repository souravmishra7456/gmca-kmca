const crypto = require("crypto");

const VALID_ROLES = ["chairman", "director", "player"];

const buildUsername = (fullName) => {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length < 2) {
        throw new Error("Full name must include first and last name");
    }

    const firstName = parts[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const lastName = parts[parts.length - 1]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    if (!firstName || !lastName) {
        throw new Error("Full name must include valid first and last name");
    }

    return `${firstName}.${lastName}@gmca-kmca.com`;
};

const resolveUniqueUsername = async (User, baseUsername) => {
    let username = baseUsername;
    let counter = 2;

    while (await User.exists({ username })) {
        const [localPart, domain] = baseUsername.split("@");
        username = `${localPart}${counter}@${domain}`;
        counter += 1;
    }

    return username;
};

const generateTempPassword = () => {
    return crypto.randomBytes(4).toString("hex");
};

const generateMemberId = async (User) => {
    let memberId;
    let exists = true;

    while (exists) {
        memberId = `GMCA${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        exists = await User.exists({ memberId });
    }

    return memberId;
};

module.exports = {
    VALID_ROLES,
    buildUsername,
    resolveUniqueUsername,
    generateTempPassword,
    generateMemberId,
};
