const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

async function sendFivemServerStatusMessage(client) {
    const channel = client.channels.cache.get(process.env.STATUS_CHANNEL_ID);

    if (!channel) {
        console.error('Canale non trovato');
        return;
    }

    let message;

    try {
        const messages = await channel.messages.fetch({ limit: 1 });
        if (messages.size > 0) {
            message = messages.first();
        }
    } catch (error) {
        console.warn('Errore durante il recupero del messaggio:', error);
    }

    if (!message) {
        const initialEmbed = new EmbedBuilder()
            .setTitle('Stato del Server FiveM')
            .setDescription('Recupero informazioni...')
            .setColor('Yellow')
            .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
            .setTimestamp()
            .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });

        message = await channel.send({ embeds: [initialEmbed] });
    }

    const updateEmbed = async () => {
        try {
            const response = await axios.get(`http://${process.env.FIVEM_SERVER_IP}/info.json`, { timeout: 5000 });
            const playersResponse = await axios.get(`http://${process.env.FIVEM_SERVER_IP}/players.json`, { timeout: 5000 });

            const serverInfo = response.data;
            const players = playersResponse.data;

            const embed = new EmbedBuilder()
                .setTitle('Status del Server')
                .setColor('Green')
                .addFields(
                    { name: 'Stato', value: 'Online', inline: true },
                    { name: 'Giocatori', value: `${players.length}/${serverInfo.vars.sv_maxClients}`, inline: true },
                )
                .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
                .setTimestamp()
                .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });

            await message.edit({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle('Status del Server')
                .setColor('Red')
                .addFields(
                    { name: 'Stato', value: 'Offline', inline: true }
                )
                .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
                .setTimestamp()
                .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' })

            await message.edit({ embeds: [embed] });
        }
    };

    setInterval(updateEmbed, 10000);
}

module.exports = {
    customId: "sendStatusEmbed",
    async execute(client) {
        sendFivemServerStatusMessage(client);
    }
};
