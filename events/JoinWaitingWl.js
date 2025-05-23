require('dotenv').config();
const WHITELIST_WAIT_CHANNEL_ID = process.env.WHITELIST_WAIT_CHANNEL;

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const isTargetChannel = (channel) => channel && channel.id === WHITELIST_WAIT_CHANNEL_ID;

        if (!oldState.channel && isTargetChannel(newState.channel)) {
            client.joinWaitingWl.set(newState.member.id, {
                channelId: newState.channel.id,
                joinTimestamp: Date.now(),
            });
        }

        if (isTargetChannel(oldState.channel) && !newState.channel) {
            client.joinWaitingWl.delete(oldState.member.id);
        }

        if (isTargetChannel(oldState.channel) && !isTargetChannel(newState.channel)) {
            client.joinWaitingWl.delete(oldState.member.id);
        }

        if (!isTargetChannel(oldState.channel) && isTargetChannel(newState.channel)) {
            client.joinWaitingWl.set(newState.member.id, {
                channelId: newState.channel.id,
                joinTimestamp: Date.now(),
            });
        }
    },
};
