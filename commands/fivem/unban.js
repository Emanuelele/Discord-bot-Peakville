const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');
const { isUserBanned, unBann } = require('../../managers/fivemManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Rimuove il ban di un giocatore sul server FiveM.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente da sbannare')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const isBanned = await isUserBanned(user.id);

        if (!isBanned) {
            return await interaction.editReply(`L'utente non è bannato.`);
        }
        try {
            unBann(user.id)
            await interaction.editReply(`Giocatore unbannato con successo!`);
        } catch (error) {
            logger.error(error);
            await interaction.editReply("Errore durante l\'unban del giocatore. Prova di nuovo più tardi.");
        }
    },
};
