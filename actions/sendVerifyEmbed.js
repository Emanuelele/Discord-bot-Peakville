const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const logger = require('../utils/loggers.js');
require('dotenv').config();

module.exports = {
    customId: "sendVerifyEmbed",
    async execute(client) {

        const channel = client.channels.cache.get(process.env.VERIFY_CHANNEL_ID);

        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            if (messages.size > 0) {
                logger.warn(`C'è già un messaggio nel canale ${channel.name}.`);
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(0xf9f4d8)
                .setTitle('Modulo di verifica')
                .setDescription('Premi il pulsante sottostante per verificare il tuo profilo.')
                .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
                .setTimestamp()
                .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });

            const button = new ButtonBuilder()
                .setCustomId('sendVerifyMsg')
                .setLabel('Verificati!')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            await channel.send({ embeds: [embed], components: [row] });
            logger.success(`Messaggio inviato con successo nel canale ${channel.name}.`);
        } catch (error) {
            logger.error(`Errore durante l\'invio del messaggio: ${error}`);
        }
    }
}