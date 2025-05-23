const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fivemkick')
        .setDescription('kicka un player sul server Fivem.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Motivo')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        try {
            const response = await axios.post('http://localhost:30120/lele_dis_int/fdiscord/kick', {
                discordId: user.id,
                reason: reason,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 7000,
            });
            await interaction.editReply(`Richista inoltrata: ${response.data.message}`);
        } catch (error) {
            logger.error(error);
            await interaction.editReply("Errore durante il kick del giocatore. Prova di nuovo più tardi.");
        }
    },
};