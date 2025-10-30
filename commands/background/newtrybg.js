const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { giveNewTry } = require('../../managers/backgroundsManager');
const logger = require('../../utils/loggers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newtrybg')
        .setDescription('Dai un nuovo tentativo all\'utente')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
            .setDescription('Utente')
            .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        try {
            const result = await giveNewTry(user.id)
            if (result) 
                return await interaction.editReply('New try gived.');
            else
                return await interaction.editReply('New try not gived.');
        } catch (error) {
            await interaction.editReply('Si è verificato un errore durante il giving del background.');
        }
    },
};
