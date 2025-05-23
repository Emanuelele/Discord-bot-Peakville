const { ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'close_ticket',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const staffRoleId = process.env.STAFF_ROLE_ID;
        const userRoles = interaction.member.roles.cache;

        if (!userRoles.has(staffRoleId)) {
            return interaction.editReply({
                content: 'Non hai il permesso per chiudere il ticket.',
                flags: MessageFlags.Ephemeral,
            });
        }


        const channel = interaction.channel;
        const creatorId = channel.topic;

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_close_ticket')
            .setLabel('Conferma')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(confirmButton);

        await interaction.editReply({
            content: 'Sei sicuro di voler chiudere il ticket?',
            components: [actionRow],
            flags: MessageFlags.Ephemeral,
        });
    }
}