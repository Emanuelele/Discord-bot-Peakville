const db = require('../utils/database');

async function getAttempts(userId) {
    const query = 'SELECT attempts FROM verification_attempts WHERE user_id = ?';
    const [result] = await db.pool.execute(query, [userId]);
    return result.length > 0 ? result[0].attempts : 0;
}

async function incrementAttempts(userId) {
    const queryUpdate = 'UPDATE verification_attempts SET attempts = attempts + 1 WHERE user_id = ?';
    const [updateResult] = await db.pool.execute(queryUpdate, [userId]);
    
    if (updateResult.affectedRows === 0) {
        const queryInsert = 'INSERT INTO verification_attempts (user_id, attempts) VALUES (?, 1)';
        await db.pool.execute(queryInsert, [userId]);
    }
}
module.exports = {
    getAttempts,
    incrementAttempts
}