const { transcriptTicket, getOpenTicketByCreatorId } = require('../../managers/ticketsManager');
const { generateTranscript } = require('../../utils/transcriptGenerator');
const { MessageFlags } = require('discord.js');

module.exports = {
    name: 'confirm_close_ticket',
    async execute(interaction, client) {
        await interaction.deferReply();
        const channel = interaction.channel;
        const creatorId = channel.topic;
        const closerId = interaction.user.id;

        const openTicket = await getOpenTicketByCreatorId(creatorId);
        if (!openTicket) {
            return interaction.editReply({
                content: 'Errore: Impossibile trovare il ticket nel database.',
                flags: MessageFlags.Ephemeral
            });
        }

        const ticketId = openTicket.id;

        await interaction.editReply({
            content: '⏳ Salvataggio del transcript e degli allegati in corso, per favore attendi...',
            flags: MessageFlags.Ephemeral
        });

        try {
            let allMessages = new Map();
            let lastId;
            let keepFetching = true;

            while (keepFetching) {
                const options = { limit: 100 };
                if (lastId) options.before = lastId;

                const messages = await channel.messages.fetch(options);
                if (messages.size === 0) {
                    keepFetching = false;
                } else {
                    for (const [id, msg] of messages) {
                        allMessages.set(id, msg);
                    }
                    lastId = messages.last().id;
                }
            }

            const transcriptUrl = await generateTranscript(allMessages, ticketId, channel.name);

            await transcriptTicket(ticketId, closerId, transcriptUrl);

            await interaction.channel.delete();

        } catch (error) {
            console.error('Errore durante il salvataggio del transcript:', error);
            await interaction.editReply({
                content: '❌ Si è verificato un errore durante il salvataggio del transcript. Controlla i log. Il canale non è stato eliminato per sicurezza.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}