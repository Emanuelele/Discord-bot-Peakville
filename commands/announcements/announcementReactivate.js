const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getPausedAnnouncements } = require('../../managers/announcementsManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcement-reactivate')
        .setDescription('Riattiva un annuncio.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const announcements = await getPausedAnnouncements();

        if (!announcements || announcements.length === 0) {
            return interaction.editReply({
                content: 'Non ci sono annunci da riattivare.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const menuOptions = announcements.map((ann, index) => ({
            label: `Annuncio ${index + 1}`,
            description: `Canale: ${client.channels.cache.get(ann.channel_id).name}, Titolo: ${ann.title}, Messaggio: ${ann.message}`,
            value: ann.id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('announcementReactivateSelect')
            .setPlaceholder('Seleziona un annuncio da riattivare')
            .addOptions(menuOptions);

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirmReactivate')
            .setLabel('Conferma')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancelReactivate')
            .setLabel('Annulla')
            .setStyle(ButtonStyle.Secondary);

        const components = [
            new ActionRowBuilder().addComponents(selectMenu),
            new ActionRowBuilder().addComponents(confirmButton, cancelButton),
        ];

        await interaction.editReply({
            content: 'Seleziona l\'annuncio da riattivare:',
            components,
            flags: MessageFlags.Ephemeral,
        });
    },
};
