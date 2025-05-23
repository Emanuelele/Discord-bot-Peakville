const { createLog } = require('../../managers/fivemManager.js');
const logger = require('../../utils/loggers.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        try {
            const member = newState.member;
            const oldChannel = oldState.channel;
            const newChannel = newState.channel;

            if (!oldChannel && newChannel) {
                let metadata = {
                    "executor": member.id,
                    "channel": newChannel.name,
                };
                await createLog("VOICE_CHANNEL_JOIN_DISCORD", metadata);
            }

            if (oldChannel && !newChannel) {
                let metadata = {
                    "executor": member.id,
                    "channel": oldChannel.name,
                };
                await createLog("VOICE_CHANNEL_LEFT_DISCORD", metadata);
            }
        } catch(error) {
            logger.error("Errore nella creazione del log: relosLog.js: " + error);
        }
    },
};
