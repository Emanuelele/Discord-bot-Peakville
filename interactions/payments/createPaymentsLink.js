const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: 'createPaymentLink',
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('paymentAmountModal')
            .setTitle('Ricarica Crediti');

        const amountInput = new TextInputBuilder()
            .setCustomId('amount')
            .setLabel('Importo da ricaricare (in EUR)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Es: 5')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(amountInput);

        modal.addComponents(row);
        await interaction.showModal(modal);
    }
}