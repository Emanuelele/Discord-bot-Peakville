const logger = require('../utils/loggers.js');
const dynamicChannels = new Map();
const channelConfig = require('../config/dynamicChannels.json');
require('dotenv').config();

async function rebuildDynamicChannelsMap(guild) {
    const mainChannelIds = channelConfig.map(c => c.channelId);

    for (const [id, channel] of guild.channels.cache) {
        if (channel.type === 2 && channel.parent) {
            const parentChannels = guild.channels.cache.filter(
                ch => mainChannelIds.includes(ch.id) && ch.parent?.id === channel.parent.id
            );

            if (parentChannels.size > 0) {
                const matchingConfig = channelConfig.find(c =>
                    channel.name.startsWith(c.name.split('・')[0]) ||
                    channel.name.startsWith(c.name.split('︱')[0])
                );

                if (matchingConfig && !mainChannelIds.includes(id)) {
                    dynamicChannels.set(id, channel);
                }
            }
        }
    }
}

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        try {
            if (newState.guild && dynamicChannels.size === 0) {
                await rebuildDynamicChannelsMap(newState.guild);
            }

            for (const config of channelConfig) {
                if (newState.channelId === config.channelId && !dynamicChannels.has(newState.id)) {
                    setTimeout(async () => {
                        const mainChannel = newState.channel;
                        try {
                            const newChannel = await newState.guild.channels.create({
                                name: config.name,
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
            }

            for (const [channelId] of dynamicChannels.entries()) {
                const voiceChannel = oldState.guild.channels.cache.get(channelId);

                if (!voiceChannel) {
                    dynamicChannels.delete(channelId);
                    continue;
                }

                setTimeout(async () => {
                    const currentChannel = oldState.guild.channels.cache.get(channelId);

                    if (currentChannel && currentChannel.members.size === 0) {
                        try {
                            await currentChannel.delete();
                            dynamicChannels.delete(channelId);
                            logger.info(`Canale dinamico eliminato: ${currentChannel.name}`);
                        } catch (error) {
                            if (error.code === 10003) {
                                dynamicChannels.delete(channelId);
                            } else {
                                logger.error(`Errore durante l'eliminazione del canale dinamico: ${error}`);
                            }
                        }
                    }
                }, 500);
            }
        } catch (error) {
            logger.error(`Errore durante il controllo del canale dinamico: ${error}`);
        }
    },
};