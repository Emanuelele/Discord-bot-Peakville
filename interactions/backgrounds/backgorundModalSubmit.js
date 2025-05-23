const { MessageFlags } = require('discord.js');
const axios = require('axios');
const logger = require('../../utils/loggers.js');

module.exports = {
    name: 'backgroundModal',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const generalita = interaction.fields.getTextInputValue('nameandsurname');
        const backgroundLink = interaction.fields.getTextInputValue('background_link');
        try {
            await axios.post(`${process.env.WEBSITE_LINK}/api/newbackground`, {
                generality: generalita,
                google_doc_link: backgroundLink,
                discord_id: interaction.user.id,
            });
            await interaction.editReply({ content: "Modulo inviato con successo!" });
        } catch (error) {
            logger.error(`Errore durante l\'invio del modulo: ${error.response.data?.error || JSON.stringify(error.response.data)}`);
            await interaction.editReply({ content: `Errore durante l\'invio del modulo:  ${error.response.data?.error || JSON.stringify(error.response.data)}`, flags: MessageFlags.Ephemeral });
        }
    }
}
