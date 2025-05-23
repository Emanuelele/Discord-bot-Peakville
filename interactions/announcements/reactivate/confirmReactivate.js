const { reactiveAnnouncementJob, reactivateAnnouncement } = require('../../../managers/announcementsManager');
const { MessageFlags } = require('discord.js');
module.exports = {
    name: 'confirmReactivate',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const reactivateann = await reactivateAnnouncement(client.reactivateann);
        reactiveAnnouncementJob(client, reactivateann[0]);

        await interaction.editReply({
            content: `Annuncio con ID ${client.reactivateann} riattivato!`,
            components: [],
            flags: MessageFlags.Ephemeral,
        });
    },
};
