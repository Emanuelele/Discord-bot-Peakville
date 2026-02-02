const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { resetCooldownToLatestBackground } = require('../../managers/backgroundsManager');
const logger = require('../../utils/loggers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetcooldown')
        .setDescription('Resetta il cooldown dell\'ultimo background dell\'utente')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
            .setDescription('Utente')
            .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        try {
            const result = await resetCooldownToLatestBackground(user.id)
            if (result)
                return await interaction.editReply('Cooldown resettato.');
            else
                return await interaction.editReply('Nessun background da resettare.');
        } catch (error) {
            await interaction.editReply('Si è verificato un errore durante il reset del cooldown.');
        }
    },
};
