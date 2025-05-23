const { SlashCommandBuilder, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');
const db = require('../../utils/database.js');
const logger = require('../../utils/loggers.js');
const { getTicketbyCreatorId } = require('../../managers/ticketsManager.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-get')
        .setDescription('Leggi la trascrizione di un ticket di un utente')
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
            const tickets = await getTicketbyCreatorId(user.id);
            if (tickets.length === 0) {
                return interaction.editReply({content: `Non ci sono ticket aperti da ${user.tag}.`,flags: MessageFlags.Ephemeral,});
            }

            const options = tickets.map(ticket => ({
                label: `Ticket #${ticket.id} - ${new Date(ticket.created_at).toLocaleString()}`,
                value: ticket.id.toLocaleString(),
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_ticket')
                .setPlaceholder('Seleziona un ticket...')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.editReply({
                content: 'Seleziona un ticket:',
                components: [row],
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            logger.error(`Errore durante la gestione dell\'interazione in ticket get: ${error}`);
            return interaction.editReply({
                content: 'Si è verificato un errore durante l\'esecuzione del comando',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};