const { SlashCommandBuilder, PermissionFlagsBits, ApplicationCommandType, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');
const { executeBackup } = require('../../autoBackup.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup')
        .setDescription('Crea un backup del database.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await executeBackup();
        return await interaction.editReply(`Backup fattoh!!!!!!!!!!!!!`);
    },
};