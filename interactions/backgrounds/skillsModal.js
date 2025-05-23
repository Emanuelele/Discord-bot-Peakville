const { MessageFlags } = require('discord.js');
const axios = require('axios');
const logger = require('../../utils/loggers.js');

module.exports = {
    name: 'customid da intercettare',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const response = await fetch('https://admin.peakville.it/api/generate-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ discord_id: interaction.user.id })
        });
        const result = await response.json();
        return await interaction.editReply({
            content: 'Risposta dal server: ' + result.link,
            flags: MessageFlags.Ephemeral
        });
    },
};

