const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getAllAnnouncements } = require('../../managers/announcementsManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcement-delete')
        .setDescription('Elimina un annuncio.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const announcements = await getAllAnnouncements();

        if (!announcements || announcements.length === 0) {
            return interaction.editReply({
                content: 'Non ci sono annunci da eliminare.',
                flags: MessageFlags.Ephemeral,
            });
        }
        
        const menuOptions = announcements.map((ann, index) => ({
            label: `Annuncio ${index + 1}`,
            description: `Canale: ${client.channels.cache.get(ann.channel_id).name}, Attivo: ${ann.active ? "si" : "no"}, Titolo: ${ann.title},  Messaggio: ${ann.message}`,
            value: ann.id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('announcementDeleteSelect')
            .setPlaceholder('Seleziona un annuncio da eliminare')
            .addOptions(menuOptions);

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirmDelete')
            .setLabel('Conferma')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancelDelete')
            .setLabel('Annulla')
            .setStyle(ButtonStyle.Secondary);

        const components = [
            new ActionRowBuilder().addComponents(selectMenu),
            new ActionRowBuilder().addComponents(confirmButton, cancelButton),
        ];

        await interaction.editReply({
            content: 'Seleziona l\'annuncio da eliminare:',
            components,
            flags: MessageFlags.Ephemeral,
        });
    },
};
