const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { assignPriorityToLatestNewBackground } = require('../../managers/backgroundsManager');
const logger = require('../../utils/loggers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skipbg')
        .setDescription('Fai saltare la coda dei background all\'utente')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
            .setDescription('Utente')
            .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        try {
            const result = await assignPriorityToLatestNewBackground(user.id)
            if (result) 
                return await interaction.editReply('Background skipped.');
            else
                return await interaction.editReply('Background not skipped.');
        } catch (error) {
            await interaction.editReply('Si è verificato un errore durante lo skipping del background.');
        }
    },
};
