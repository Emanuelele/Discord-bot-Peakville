const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
    name: 'scheduleInterface',
    async execute(interaction, client) {
        //await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

        const generateDayMenu = () => {
            const buttons = daysOfWeek.map((day, index) => ({
                label: day,
                value: `${index}`,
            }));

            const menu = new StringSelectMenuBuilder()
                .setCustomId('daysSelection')
                .setPlaceholder('Seleziona i giorni')
                .setMinValues(1)
                .setMaxValues(daysOfWeek.length)
                .addOptions(buttons);

            return [new ActionRowBuilder().addComponents(menu)];
        };

        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('openScheduleForm')
                .setLabel('Procedi con la configurazione oraria')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({
            content: 'Seleziona i giorni per il tuo annuncio:',
            components: [...generateDayMenu(), confirmRow],
            flags: MessageFlags.Ephemeral,
        });
    },
};
