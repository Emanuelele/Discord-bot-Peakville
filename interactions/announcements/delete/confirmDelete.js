const { stopAnnouncementJob, deleteAnnouncement } = require('../../../managers/announcementsManager');
const { MessageFlags } = require('discord.js');
module.exports = {
    name: 'confirmDelete',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await deleteAnnouncement(client.deleteann);
        stopAnnouncementJob(client.deleteann);

        await interaction.editReply({
            content: `Annuncio con ID ${client.deleteann} eliminato con successo!`,
            components: [],
            flags: MessageFlags.Ephemeral,
        });
    },
};
