const crypto = require("crypto");

const sessions = new Map();
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const createSession = (userId) => {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, {
        userId: String(userId),
        expiresAt: Date.now() + SESSION_DURATION_MS,
    });
    return sessionId;
};

const getSession = (sessionId) => {
    const session = sessions.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
        sessions.delete(sessionId);
        return null;
    }
    return session;
};

const deleteSession = (sessionId) => sessions.delete(sessionId);

module.exports = { createSession, getSession, deleteSession, SESSION_DURATION_MS };
