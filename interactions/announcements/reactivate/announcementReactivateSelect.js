const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'announcementReactivateSelect',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const selectedId = interaction.values[0];
        client.reactivateann = selectedId;

        await interaction.editReply({
            content: 'Annuncio selezionato con successo',
            flags: MessageFlags.Ephemeral,
        });
    }
};