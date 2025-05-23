const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-add-user')
        .setDescription('Aggiungi un utente specifico al ticket')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const user = interaction.options.getUser('user');
            const channel = interaction.channel;
            if (!channel.name.startsWith('ticket')) {
                return interaction.editReply({
                    content: 'Questo comando può essere eseguito solo nei canali ticket.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            await channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                AttachFiles: true,
            });

            await interaction.editReply({
                content: `L'utente ${user} è stato aggiunto ai permessi del ticket.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            logger.error(`Errore durante la gestione dell\'interazione in ticket add user: ${error}`);
            return interaction.editReply({
                content: 'Si è verificato un errore durante l\'esecuzione del comando',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};