const logger = require('../utils/loggers.js');
const dynamicChannels = new Map();
require('dotenv').config();

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const mainVoiceChannelId = process.env.SUPPORT_CHANNEL;
        try {
            if (newState.channelId === mainVoiceChannelId && !dynamicChannels.has(newState.id)) {
                setTimeout(async () => {

                    const mainChannel = newState.channel;
                    try {
                        const newChannelName = `🌈︱Supporto`;

                        const newChannel = await newState.guild.channels.create({
                            name: newChannelName,
                            type: 2,
                            parent: mainChannel.parent,
                            permissionOverwrites: mainChannel.permissionOverwrites.cache.map(overwrite => ({
                                id: overwrite.id,
                                allow: overwrite.allow,
                                deny: overwrite.deny,
                            })),
                        });

                        dynamicChannels.set(newChannel.id, newChannel);
                        await newState.setChannel(newChannel);
                        logger.info(`Creato nuovo canale dinamico: ${newChannel.name}`);
                    } catch (error) {
                        logger.error(`Errore durante la creazione del canale dinamico: ${error}`);
                    }
                }, 1000);
            }
        

            for (const [channelId, channel] of dynamicChannels.entries()) {
                const voiceChannel = oldState.guild.channels.cache.get(channelId);
                if (!voiceChannel) {
                    dynamicChannels.delete(channelId);
                    continue;
                }
                setTimeout(async () => {
                    if (voiceChannel.members.size === 0) {
                        try {
                            await voiceChannel.delete();
                            dynamicChannels.delete(channelId);
                            logger.info(`Canale dinamico eliminato: ${voiceChannel.name}`);
                        } catch (error) {
                            logger.error(`Errore durante l'eliminazione del canale dinamico: ${error}`);
                        }
                    }
                }, 500);
            }
        } catch(error) {
            logger.error(`Errore durante il controllo del canale dinamico: ${error}`);
        }
    },
};
