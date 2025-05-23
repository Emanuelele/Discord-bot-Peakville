const logger = require('../utils/loggers.js');
const db = require('../utils/database');
const axios = require('axios');
require('dotenv').config();

async function checkBackgroundRecord(discordId) {
    try {
        const [result] = await db.query(
            'SELECT * FROM backgrounds WHERE discord_id = ?',
            [discordId]
        );

        return result;
    } catch (error) {
        logger.error(`Errore durante il controllo della tabella "backgrounds": ${error.message}`);
        throw new Error('Errore durante il controllo della tabella backgrounds.');
    }
}

async function getSuspensionStatus(discord_id) {
    const query = `SELECT * FROM suspensions WHERE user_id = ?`;
    const [result] = await db.execute(query, [discord_id]);
    return result[0] || null;
}


async function updateSuspensionStatus(discord_id, remand_count, suspension_end) {
    const query = `
        INSERT INTO suspensions (user_id, remand_count, suspension_end)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE remand_count = ?, suspension_end = ?`;
    
    const [result] = await db.execute(query, [discord_id, remand_count, suspension_end, remand_count, suspension_end]);
    return result;
}

async function getAndIncrementRemandCount(discord_id) {
    const userStatus = await getSuspensionStatus(discord_id);

    let remand_count = 0;

    if (userStatus) {
        if(userStatus.remand_coun == 3) return 4;
        remand_count = userStatus.remand_count + 1;
    } else {
        remand_count = 1;
    }

    await updateSuspensionStatus(discord_id, remand_count, 0);

    return remand_count;
}

async function applySuspension(discord_id, suspension_duration) {
    const userStatus = await getSuspensionStatus(discord_id);

    let suspension_end = Date.now() + suspension_duration;

    if (userStatus) {
        await updateSuspensionStatus(discord_id, userStatus.remand_count, suspension_end);
    } else {
        await updateSuspensionStatus(discord_id, 1, suspension_end);
    }

    return suspension_end;
}

async function applyPermanentSuspension(discord_id) {
    const query = `UPDATE suspensions SET suspension_end = 0 WHERE user_id = ?`;
    const [result] = await db.execute(query, [discord_id]);
    return result;
}

async function reopenWl() {
    const query = `TRUNCATE TABLE suspensions`;
    const [result] = await db.execute(query);
    return result;
}

async function getLinksByDiscordId(discordId) {
    try {
        const [rows] = await db.query(
            'SELECT link, created_at FROM links WHERE discord_id = ? ORDER BY created_at DESC',
            [discordId]
        );
        return rows;
    } catch (error) {
        logger.error(`Errore durante il recupero dei link: ${error.message}`);
        throw new Error('Errore durante il recupero dei link.');
    }
}


module.exports = {
    checkBackgroundRecord,
    getAndIncrementRemandCount,
    applySuspension,
    applyPermanentSuspension,
    updateSuspensionStatus,
    getSuspensionStatus,
    reopenWl,
    getLinksByDiscordId
}