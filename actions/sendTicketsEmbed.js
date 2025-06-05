const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const logger = require('../utils/loggers.js');
require('dotenv').config();

module.exports = {
    customId: "sendTicketsEmbed",
    async execute(client) {

        const channel = client.channels.cache.get(process.env.TICKETS_CHANNEL_ID);

        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            if (messages.size > 0) {
                logger.warn(`C'è già un messaggio nel canale ${channel.name}.`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0xf9f4d8)
                .setTitle('Tickets')
                .setDescription('Clicca su uno dei pulsanti qui sotto per aprire un ticket e ricevere supporto.')
                .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
                .setTimestamp()
                .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });
            const components = [
                new ButtonBuilder()
                    .setCustomId('general_ticket')
                    .setLabel('Generale')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('bug_ticket')
                    .setLabel('Bug')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('perma_ticket')
                    .setLabel('Permadeath')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('purchase_ticket')
                    .setLabel('Donazioni')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('activity_ticket')
                    .setLabel('Attività')
                    .setStyle(ButtonStyle.Primary)
            ]
            const row = new ActionRowBuilder().addComponents(components);

            await channel.send({ embeds: [embed], components: [row] });
            logger.success(`Messaggio inviato con successo nel canale ${channel.name}.`);
        } catch (error) {
            logger.error(`Errore durante l\'invio del messaggio: ${error}`);
        }
    }
}