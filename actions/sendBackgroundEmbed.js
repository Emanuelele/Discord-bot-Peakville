const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const logger = require('../utils/loggers.js');
require('dotenv').config();

module.exports = {
    customId: "sendBackgroundEmbed",
    async execute(client) {

        const channel = client.channels.cache.get(process.env.BACKGROUND_CHANNEL_ID);

        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            if (messages.size > 0) {
                logger.warn(`C'è già un messaggio nel canale ${channel.name}.`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0xf9f4d8)
                .setTitle('Scheda personaggio')
                .setDescription('Clicca sul pulsante qui sotto per ottenere il link del modulo da compilare.\n\nUna particolare attenzione all\'attenta lettura delle guide e del mood nel nostro sito: https://www.peakville.it  \n\nSe hai perso il tuo link clicca comunque il pulsante "Ottieni link" per recuperarlo.')
                .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
                .setTimestamp()
                .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });

            const button = new ButtonBuilder()
                .setCustomId('openBackgroundForm')
                .setLabel('Ottieni link')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            await channel.send({ embeds: [embed], components: [row] });
            logger.success(`Messaggio inviato con successo nel canale ${channel.name}.`);
        } catch (error) {
            logger.error(`Errore durante l\'invio del messaggio: ${error}`);
        }
    }
}