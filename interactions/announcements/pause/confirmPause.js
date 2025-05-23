const { stopAnnouncementJob, pauseAnnouncement } = require('../../../managers/announcementsManager');
const { MessageFlags } = require('discord.js');
module.exports = {
    name: 'confirmPause',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await pauseAnnouncement(client.pauseann);
        stopAnnouncementJob(client.pauseann);
        await interaction.editReply({
            content: `Annuncio con ID ${client.pauseann} messo in pausa!`,
            components: [],
            flags: MessageFlags.Ephemeral,
        });
    },
};
