const { transcriptTicket } = require('../../managers/ticketsManager');

module.exports = {
    name: 'confirm_close_ticket',
    async execute(interaction, client) {
        const channel = interaction.channel;
        const creatorId = channel.topic;
        const closerId = interaction.user.id;
        const messages = await channel.messages.fetch({ limit: 100 });
        const sortedMessages = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        const transcript = sortedMessages
            .map(msg => `[${new Date(msg.createdTimestamp).toLocaleString()}] ${msg.author.tag}: ${msg.content || '(Allegato o messaggio vuoto)'}`)
            .join('\n');

        transcriptTicket(creatorId, closerId, transcript);
        interaction.channel.delete();
    }
}