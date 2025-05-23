const { createLog } = require('../../managers/fivemManager');
const logger = require('../../utils/loggers.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        try {
            const metadata = {
            "executor": member.user.id
            }
            await createLog("PLAYER_QUIT_DISCORD", metadata);
        
        } catch(error) {
            logger.error("Errore nella creazione del log: PLAYER_QUIT_DISCORD");
        }
        
    },
};