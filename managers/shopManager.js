const logger = require('../utils/loggers.js');
const db = require('../utils/database');
const axios = require('axios');

async function addTokens(userId, amount) {
    const existingUser = await db.pool.query('SELECT * FROM shop_users WHERE id = ?', [userId]);
    if (existingUser[0].length === 0) {
        return false;
    } else {
        const query = `UPDATE shop_users SET wallet = wallet + ? WHERE id = ?`;
        const [result] = await db.pool.execute(query, [amount, userId]);
        return result;
    }
}

async function setTokens(userId, amount) {
    const existingUser = await db.pool.query('SELECT * FROM shop_users WHERE id = ?', [userId]);
    if (existingUser[0].length === 0) {
        return false;
    } else {
        const query = `UPDATE shop_users SET wallet = ? WHERE id = ?`;
        const [result] = await db.pool.execute(query, [amount, userId]);
        return result;
    }
}

async function getTokens(userId) {
    const existingUser = await db.pool.query('SELECT * FROM shop_users WHERE id = ?', [userId]);
    if (existingUser[0].length === 0) {
        return false;
    } else {
        return existingUser[0][0].wallet;
    }
}

async function removeTokens(userId, amount) {
    const existingUser = await db.pool.query('SELECT * FROM shop_users WHERE id = ?', [userId]);
    if (existingUser[0].length === 0) {
        return false;
    } else {
        const query = `UPDATE shop_users SET wallet = wallet - ? WHERE id = ?`;
        const [result] = await db.pool.execute(query, [amount, userId]);
        return result;
    }
}

module.exports = {
    addTokens,
    setTokens,
    getTokens,
    removeTokens,
};
