const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'scheduleModalSubmit',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const hours = interaction.fields.getTextInputValue('hours_input');
        const minutes = interaction.fields.getTextInputValue('minutes_input');
        const selectedDays = client.selectedDays || [];

        if (
            isNaN(hours) || hours < 0 || hours > 23 ||
            isNaN(minutes) || minutes < 0 || minutes > 59
        ) {
            return interaction.editReply({
                content: 'Inserisci valori validi per ore e minuti!',
                flags: MessageFlags.Ephemeral,
            });
        }
        
        interaction.editReply({
            content: `Configurazione completata!\nOre: ${hours}, Minuti: ${minutes}\nGiorni selezionati: ${selectedDays.join(', ') || 'Tutti'}`,
            flags: MessageFlags.Ephemeral,
        });

        client.emit('scheduleConfigured', { hours, minutes, selectedDays });
    },
};
