const { Events } = require('discord.js');
const { getSuspensionStatus } = require('../managers/backgroundsManager');
require('dotenv').config();

const WHITELIST_WAIT_CHANNEL_ID = process.env.WHITELIST_WAIT_CHANNEL;

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {

        if (oldState.channelId === newState.channelId) return;

        if (newState.channelId === WHITELIST_WAIT_CHANNEL_ID) {
            const member = newState.member;

            try {
                const userStatus = await getSuspensionStatus(member.id);

                if (userStatus) {

                    const now = Date.now();
                    if (userStatus.suspension_end === 0 || userStatus.suspension_end > now) {

                        await member.voice.setChannel(null);

                        const reason = userStatus.suspension_end === 0
                            ? 'Sei stato sospeso permanentemente e non puoi accedere al canale attesa whitelist.'
                            : `Sei ancora sospeso fino al ${new Date(userStatus.suspension_end).toLocaleString()}.`;

                        await member.send(reason).catch(err => {
                            console.error(`Impossibile inviare un messaggio all'utente ${member.user.tag}:`, err);
                        });

                    } else if (userStatus.remand_count >= 3) {

                        await member.voice.setChannel(null);

                        const reason = 'Hai fallito tre colloqui e non puoi accedere al canale attesa whitelist.';
                        await member.send(reason).catch(err => {
                            console.error(`Impossibile inviare un messaggio all'utente ${member.user.tag}:`, err);
                        });
                    }
                }
            } catch (error) {
                console.error(`Errore durante il controllo della sospensione per ${member.user.tag}:`, error);
            }
        }
    },
};
