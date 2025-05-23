const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messages-delete-user')
        .setDescription('Elimina gli ultimi X messaggi di uno specifico utente nel canale corrente')
        .addUserOption(option => 
            option.setName('utente')
                .setDescription('Seleziona l\'utente di cui eliminare i messaggi')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('numero')
                .setDescription('Numero di messaggi da eliminare')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('utente');
        const numero = interaction.options.getInteger('numero');

        if (numero < 1 || numero > 100) {
            return interaction.editReply({
                content: 'Puoi eliminare solo tra 1 e 100 messaggi.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const channel = interaction.channel;

        try {
            const messages = await channel.messages.fetch({ limit: 100 });

            const userMessages = messages.filter(msg => msg.author.id === user.id);
            const messagesToDelete = userMessages.first(numero);

            if (messagesToDelete.size === 0) {
                return interaction.editReply({
                    content: `Non ci sono messaggi di ${user.tag} da eliminare nel canale.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            await channel.bulkDelete(messagesToDelete, true);

            await interaction.editReply({
                content: `Sono stati correttamente eliminati i messaggi di ${user.tag} dal canale.`,
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
