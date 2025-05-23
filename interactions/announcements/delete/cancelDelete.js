const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'cancelDelete',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.editReply({
            content: 'Eliminazione annullata.',
            components: [],
            flags: MessageFlags.Ephemeral,
        });
    },
};