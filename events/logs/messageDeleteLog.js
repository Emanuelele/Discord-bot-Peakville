const { createLog } = require('../../managers/fivemManager');
const logger = require('../../utils/loggers.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        try {
            const metadata = {
                "executor": message.author.id,
                "messaggio": message.content
            }
            await createLog("PLAYER_DELETE_MESSAGE", metadata);
        } catch(error) {
            logger.error("Errore nella creazione del log: PLAYER_DELETE_MESSAGE: " + error);
        }
    },
};