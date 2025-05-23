const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');
module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Revive')
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
       await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.targetUser;
        try {
            const response = await axios.post('http://localhost:30120/lele_dis_int/fdiscord/revive', {
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
            await interaction.editReply("Errore durante la rianimazione del giocatore. Prova di nuovo più tardi.");
        }
    },
};