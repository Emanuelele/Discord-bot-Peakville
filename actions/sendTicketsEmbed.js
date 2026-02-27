const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const logger = require('../utils/loggers.js');
const ticketConfig = require('../config/tickets.json');
require('dotenv').config();

module.exports = {
    customId: "sendTicketsEmbed",
    async execute(client) {
        const channel = client.channels.cache.get(ticketConfig.panel.channelId);

        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            if (messages.size > 0) {
                logger.warn(`C'è già un messaggio nel canale ${channel.name}.`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(ticketConfig.panel.embed.color)
                .setTitle(ticketConfig.panel.embed.title)
                .setDescription(ticketConfig.panel.embed.description)
                .setThumbnail(ticketConfig.panel.embed.thumbnail)
                .setTimestamp()
                .setFooter({
                    text: ticketConfig.panel.embed.footer.text,
                    iconURL: ticketConfig.panel.embed.footer.iconURL
                });

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(ticketConfig.panel.button.customId)
                    .setLabel(ticketConfig.panel.button.label)
                    .setEmoji(ticketConfig.panel.button.emoji)
                    .setStyle(ButtonStyle[ticketConfig.panel.button.style])
            );

            await channel.send({ embeds: [embed], components: [row1] });
            logger.success(`Messaggio inviato con successo nel canale ${channel.name}.`);
        } catch (error) {
            logger.error(`Errore durante l'invio del messaggio: ${error}`);
        }
    }
}
