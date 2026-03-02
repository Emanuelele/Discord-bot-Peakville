const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const ticketConfig = require('../../config/tickets.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-close')
        .setDescription('Chiudi il ticket corrente'),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const staffRoleId = ticketConfig.staffRoleId;
        const userRoles = interaction.member.roles.cache;

        if (!userRoles.has(staffRoleId)) {
            return interaction.editReply({
                content: 'Non hai il permesso per chiudere il ticket.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const channel = interaction.channel;

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_close_ticket')
            .setLabel('Conferma')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(confirmButton);

        await interaction.editReply({
            content: 'Sei sicuro di voler chiudere il ticket? (Verrà generato il transcript)',
            components: [actionRow],
            flags: MessageFlags.Ephemeral,
        });
    },
};
