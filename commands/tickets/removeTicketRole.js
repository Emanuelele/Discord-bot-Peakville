const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-remove-role')
        .setDescription('Rimuovi un ruolo specifico dal ticket')
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

            const existingPermissions = channel.permissionOverwrites.cache.get(role.id);
            if (!existingPermissions) {
                return interaction.editReply({
                    content: `Il ruolo ${role} non ha permessi impostati per questo ticket.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            await channel.permissionOverwrites.delete(role.id);

            await interaction.editReply({
                content: `Il ruolo ${role} è stato rimosso dai permessi del ticket.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            logger.error(`Errore durante la gestione dell'interazione in ticket remove role: ${error}`);
            return interaction.editReply({
                content: 'Si è verificato un errore durante l\'esecuzione del comando.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
