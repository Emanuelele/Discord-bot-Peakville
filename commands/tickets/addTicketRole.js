const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-add-role')
        .setDescription('Aggiungi un ruolo specifico al ticket')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Seleziona il ruolo')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const role = interaction.options.getRole('role');
            const channel = interaction.channel;
            if (!channel.name.startsWith('ticket')) {
                return interaction.editReply({
                    content: 'Questo comando può essere eseguito solo nei canali ticket.',
                    flags: MessageFlags.Ephemeral,
                });
            }
            await channel.permissionOverwrites.edit(role.id, {
                ViewChannel: true,
                SendMessages: true,
                AttachFiles: true,
            });

            await interaction.editReply({
                content: `Il ruolo ${role} è stato aggiunto ai permessi del ticket.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            logger.error(`Errore durante la gestione dell'interazione in ticket add role: ${error}`);
            return interaction.editReply({
                content: 'Si è verificato un errore durante l\'esecuzione del comando',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
