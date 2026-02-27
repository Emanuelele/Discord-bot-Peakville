const logger = require('../utils/loggers.js');
require('dotenv').config();

const BANNED_USERS = [
    '843482921133146133',
    '275025827144663041',
];

module.exports = {
    customId: "banThread",
    async execute(client) {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        
        if (!guild) {
            logger.error('Guild non trovata');
            return;
        }

        setInterval(async () => {
            try {
                const bans = await guild.bans.fetch();
                
                for (const userId of BANNED_USERS) {
                    const isBanned = bans.has(userId);
                    
                    if (!isBanned) {
                        await guild.members.ban(userId, { reason: 'Ban automatico dal sistema' });
                        logger.info(`Utente ${userId} ribannato`);
                    }
                }
            } catch (error) {
                logger.error('Errore nel controllo ban:', error);
            }
        }, 10000);
    }
}