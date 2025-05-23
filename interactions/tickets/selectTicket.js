const { getTicketbyId } = require('../../managers/ticketsManager');
const { MessageFlags } = require('discord.js');

const MESSAGE_LENGTH_LIMIT = 2000;

module.exports = {
    name: 'select_ticket',
    async execute(interaction, client) {
        const selectedTicketId = interaction.values[0];
        const ticket = await getTicketbyId(selectedTicketId);
        const transcript = ticket[0].transcript
        await interaction.reply({
            content: `Invio della trascrizione del ticket #${selectedTicketId} in corso...`,
            flags: MessageFlags.Ephemeral,
        });

        let index = 0;
        while (index < transcript.length) {
            let offset = Math.min(MESSAGE_LENGTH_LIMIT, transcript.length - index);
            let chunk = transcript.substring(index, index + offset);
            await interaction.followUp({
                content: chunk,
                flags: MessageFlags.Ephemeral
            });
            index += MESSAGE_LENGTH_LIMIT;
        }
    }
}