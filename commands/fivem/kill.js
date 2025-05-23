const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kill')
        .setDescription('Killa un giocatore sul server FiveM.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente da killare')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        try {
            const response = await axios.post('http://localhost:30120/lele_dis_int/fdiscord/kill', {
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
            await interaction.editReply("Errore durante il killing del giocatore. Prova di nuovo più tardi.");
        }
    },
};