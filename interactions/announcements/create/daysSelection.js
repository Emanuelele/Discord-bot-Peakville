
const { MessageFlags } = require('discord.js');
module.exports = {
    name: 'daysSelection',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        const selectedDays = interaction.values.map(val => daysOfWeek[parseInt(val, 10)]);
        client.selectedDays = selectedDays;

        await interaction.editReply({
            content: `Giorni selezionati: ${selectedDays || 'Tutti'}`,
            flags: MessageFlags.Ephemeral,
        });
    },
};