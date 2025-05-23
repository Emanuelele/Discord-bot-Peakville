const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');
const { isUserBanned } = require('../../managers/fivemManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banna un giocatore sul server FiveM.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente da bannare')
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