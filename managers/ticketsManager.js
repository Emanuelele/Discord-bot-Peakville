const db = require('../utils/database');

async function createTicket(creator_id) {
    const query = `INSERT INTO tickets (creator_id) VALUES (?) `;
    return await db.execute(query, [creator_id]);
}

async function transcriptTicket(creator_id, closer_id, transcript) {
    const query = `UPDATE tickets SET closer_id = ?, transcript = ? WHERE creator_id = ?`;
    return await db.execute(query, [closer_id, transcript, creator_id]);
}

async function getTicketbyCreatorId(creator_id) {
    const query = `SELECT * FROM tickets WHERE creator_id = ?`;
    const [result] = await db.execute(query, [creator_id]);
    return result;
}

async function getTicketbyId(id) {
    const query = `SELECT * FROM tickets WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
}

async function hasOpenTicket(userId) {
    const [result] = await db.query(
        'SELECT COUNT(*) AS count FROM tickets WHERE creator_id = ? AND closer_id IS NULL ',
        [userId]
    );
    return result[0].count;
}

module.exports = {
    createTicket,
    transcriptTicket,
    getTicketbyCreatorId,
    getTicketbyId,
    hasOpenTicket
}