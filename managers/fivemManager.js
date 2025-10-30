const logger = require('../utils/loggers.js');
const db = require('../utils/database');
const axios = require('axios');

async function wsAdd(discord_id, grade) {
    const query = `
        INSERT INTO ws_users (id, grade)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE grade = VALUES(grade)
    `;
    
    const result = await db.pool2.execute(query, [discord_id, grade]);
    return result ? true : false;
}

async function wsRemove(discord_id) {
    const query = ` DELETE FROM ws_users WHERE id = ?`;
    
    const result = await db.pool2.execute(query, [discord_id]);
    return result ? true : false;
}

async function isUserBanned(discord_id){
    const query = `SELECT * FROM bans WHERE discord_id = ?`;
    const result = await db.pool2.execute(query, [discord_id]);
    if (result[0] && result[0].length > 0) {
        return true;
    }
    return false;
}

async function unBann(discord_id){
    const query = `DELETE FROM bans WHERE discord_id = ?`;
    const [result] = await db.pool2.execute(query, [discord_id]);
    return result;

}

async function createLog(category, metadata) {
    const query = `
        INSERT INTO logs (category, metadata, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
    `;
    const [result] = await db.pool2.execute(query, [category, JSON.stringify(metadata)]);
    return result;
}

module.exports = {
    wsAdd,
    wsRemove,
    isUserBanned,
    unBann,
    createLog,
}