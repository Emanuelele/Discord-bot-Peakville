const { MessageFlags } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
    name: 'paymentAmountModal',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const amount = interaction.fields.getTextInputValue('amount');
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            return await interaction.editReply({ content: 'Errore durante la creazione del link di pagamento.', flags: MessageFlags.Ephemeral });
        }

        try {
            const response = await axios({
                method: 'POST',
                url : 'https://plugin.tebex.io/payments',
                headers: {
                    'X-Tebex-Secret': process.env.TEBEX_SECRET_KEY,
                },
                data: {
                    note: `Ricarica di ${amount}€`,
                    price: parseFloat(amount),
                }
            });

                console.log(response.data);

            const link = response.data.url;
            interaction.editReply({ content: `Ecco il tuo link per ricaricare **${amount}€**:\n${link}`, flags: MessageFlags.Ephemeral });

        } catch (err) {
            console.error(err);
            return await interaction.editReply({ content: 'Errore nella generazione del link di pagamento.', flags: MessageFlags.Ephemeral });
        }
    }
}