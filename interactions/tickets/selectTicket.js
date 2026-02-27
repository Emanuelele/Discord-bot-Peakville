const { getTicketbyId } = require('../../managers/ticketsManager');
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'select_ticket',
    async execute(interaction, client) {
        const selectedTicketId = interaction.values[0];
        const ticket = await getTicketbyId(selectedTicketId);
        const transcriptUrl = ticket[0].transcript;

        if (!transcriptUrl || !transcriptUrl.startsWith('http')) {
            return interaction.reply({
                content: 'Il transcript per questo ticket non è disponibile o è nel vecchio formato testuale.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.reply({
            content: `Ecco il transcript del ticket #${selectedTicketId}:\n${transcriptUrl}`,
            flags: MessageFlags.Ephemeral,
        });
    }
}