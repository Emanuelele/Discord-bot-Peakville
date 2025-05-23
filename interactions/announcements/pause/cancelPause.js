const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'cancelPause',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await interaction.editReply({
            content: 'Operazione annullata.',
            components: [],
            flags: MessageFlags.Ephemeral,
        });
    },
};