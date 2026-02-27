const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');
const ticketConfig = require('../../config/tickets.json');

module.exports = {
    name: ticketConfig.panel.button.customId,
    async execute(interaction, client) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(ticketConfig.selectMenu.customId)
            .setPlaceholder(ticketConfig.selectMenu.placeholder)
            .addOptions(
                ticketConfig.selectMenu.options.map(opt =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(opt.label)
                        .setDescription(opt.description)
                        .setValue(opt.value)
                        .setEmoji(opt.emoji)
                )
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Seleziona dal menù sottostante il tipo di ticket che desideri aprire:',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
};
