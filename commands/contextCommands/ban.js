const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const db = require('../../utils/database.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');
const { isUserBanned } = require('../../managers/fivemManager');
module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Ban')
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.targetUser;
        const reason = "Ban dal Discord"
        const isBanned = await isUserBanned(user.id)
        if(interaction.guild.members)
            await interaction.guild.members.ban(user.id, { reason });
        if(isBanned) return await interaction.editReply(`L\'utente è già bannato`);
        try {
            const response = await axios.post('http://localhost:30120/lele_dis_int/fdiscord/ban', {
                discordId: user.id,
                adminId:  interaction.user.id,
                reason: reason
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });

            await interaction.editReply(`Richista inoltrata: ${response.data.message}`);
        } catch (error) {
            logger.error(error);
            await interaction.editReply("Errore durante il ban del giocatore. Prova di nuovo più tardi.");
        }
    },
};