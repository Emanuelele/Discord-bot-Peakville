const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const db = require('../../utils/database.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wipe')
        .setDescription('Wipa un player sul server Fivem.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        try {
            const response = await axios.post('http://localhost:30120/peakville_discordinterface/fdiscord/wipe', {
                discordId: user.id,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });

            await interaction.editReply(`Richista inoltrata: ${response.data.message}`);
        } catch (error) {
            logger.error(error);
            await interaction.editReply("Errore durante il wipe del giocatore. Prova di nuovo più tardi.");
        }

        await interaction.editReply({ content: `Giocatore ${user} wipato con successo`, flags: MessageFlags.Ephemeral });
    },
};