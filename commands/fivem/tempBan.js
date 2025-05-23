const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');
const { isUserBanned } = require('../../managers/fivemManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Banna temporaneamente un giocatore sul server FiveM.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente da bannare')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Motivo del ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Durata del ban (esempio: 1d, 12h, 30m)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const duration = interaction.options.getString('duration');
        const isBanned = await isUserBanned(user.id);

        if (isBanned) {
            return await interaction.editReply(`L'utente è già bannato.`);
        }

        const durationRegex = /^(\d+)([dhm])$/;
        const match = durationRegex.exec(duration);
        if (!match) {
            return await interaction.editReply(`Durata non valida. Usa il formato: 1d (giorni), 12h (ore), 30m (minuti).`);
        }

        const amount = parseInt(match[1], 10);
        const unit = match[2];
        const expireDate = new Date();
        if (unit === 'd') {
            expireDate.setDate(expireDate.getDate() + amount);
        } else if (unit === 'h') {
            expireDate.setHours(expireDate.getHours() + amount);
        } else if (unit === 'm') {
            expireDate.setMinutes(expireDate.getMinutes() + amount);
        }

        const formattedExpireDate = expireDate.toISOString().slice(0, 19).replace('T', ' ');

        try {
            const response = await axios.post('http://localhost:30120/lele_dis_int/fdiscord/ban', {
                discordId: user.id,
                adminId: interaction.user.id,
                reason: reason,
                expireDate: formattedExpireDate
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });

            await interaction.editReply(`Richiesta inoltrata: ${response.data.message}`);
        } catch (error) {
            logger.error(error);
            await interaction.editReply("Errore durante il ban del giocatore. Prova di nuovo più tardi.");
        }
    },
};
