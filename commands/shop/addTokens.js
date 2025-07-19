const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { addTokens } = require('../../managers/shopManager');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addtokens')
        .setDescription('Aggiungi token a un utente sullo shop')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente a cui dare token sul sito')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Numero di token da dare')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            const result = await addTokens(user.id, amount);
            if (!result) {
                return interaction.editReply({
                    content: 'L\'utente non è registrato nello shop.',
                    flags: MessageFlags.Ephemeral,
                });
            }
            await interaction.editReply({
                content: `Sono stati aggiunti ${amount} token a ${user.tag}.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error('Errore durante l\'aggiunta dei token:', error);
            await interaction.editReply({
                content: 'Si è verificato un errore durante l\'aggiunta dei token.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};