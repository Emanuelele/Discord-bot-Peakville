const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messages-delete')
        .setDescription('Elimina gli ultimi X messaggi nel canale corrente')
        .addIntegerOption(option => 
            option.setName('numero')
                .setDescription('Numero di messaggi da eliminare')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const numero = interaction.options.getInteger('numero');

        if (numero < 1 || numero > 100) {
            return interaction.editReply({
                content: 'Puoi eliminare solo tra 1 e 100 messaggi.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const channel = interaction.channel;

        try {
            const messages = await channel.messages.fetch({ limit: numero });
            await channel.bulkDelete(messages, true);

            await interaction.editReply({
                content: `Sono stati eliminati ${messages.size} messaggi dal canale.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error('Errore durante l\'eliminazione dei messaggi:', error);
            await interaction.editReply({
                content: 'Si è verificato un errore durante l\'eliminazione dei messaggi.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};