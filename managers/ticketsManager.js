const db = require('../utils/database');

async function createTicket(creator_id) {
    const query = `INSERT INTO tickets (creator_id) VALUES (?) `;
    return await db.pool.execute(query, [creator_id]);
}

async function transcriptTicket(id, closer_id, transcript) {
    const query = `UPDATE tickets SET closer_id = ?, transcript = ? WHERE id = ?`;
    return await db.pool.execute(query, [closer_id, transcript, id]);
}

async function getOpenTicketByCreatorId(creator_id) {
    const query = `SELECT * FROM tickets WHERE creator_id = ? AND closer_id IS NULL ORDER BY created_at DESC LIMIT 1`;
    const [result] = await db.pool.execute(query, [creator_id]);
    return result[0];
}

async function getTicketbyCreatorId(creator_id) {
    const query = `SELECT * FROM tickets WHERE creator_id = ?`;
    const [result] = await db.pool.execute(query, [creator_id]);
    return result;
}

async function getTicketbyId(id) {
    const query = `SELECT * FROM tickets WHERE id = ?`;
    const [result] = await db.pool.execute(query, [id]);
    return result;
}

async function hasOpenTicket(userId) {
    const [result] = await db.pool.query(
        'SELECT COUNT(*) AS count FROM tickets WHERE creator_id = ? AND closer_id IS NULL ',
        [userId]
    );
    return result[0].count;
}

module.exports = {
    createTicket,
    transcriptTicket,
    getOpenTicketByCreatorId,
    getTicketbyCreatorId,
    getTicketbyId,
    hasOpenTicket
}