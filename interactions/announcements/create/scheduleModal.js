const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'openScheduleForm',
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('scheduleModalSubmit')
            .setTitle('Configura Orario');
        
        const hours_input = new TextInputBuilder()
            .setCustomId('hours_input')
            .setLabel('Ore (0-23)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Inserisci le ore')
            .setRequired(true);
        

        const minutes_input = new TextInputBuilder()
            .setCustomId('minutes_input')
            .setLabel('Minuti (0-59)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Inserisci i minuti')
            .setRequired(true);


        const modalRows = [
            new ActionRowBuilder().addComponents(hours_input),
            new ActionRowBuilder().addComponents(minutes_input),
        ];

        modal.addComponents(modalRows);
        await interaction.showModal(modal);
    },
};
