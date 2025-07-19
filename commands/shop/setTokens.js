const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { setTokens } = require('../../managers/shopManager');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('settokens')
        .setDescription('Imposta il saldo token a un utente sullo shop')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente a cui impostare il saldo token sul sito')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Numero di token da impostare')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            const result = await setTokens(user.id, amount);
            if (!result) {
                return interaction.editReply({
                    content: 'L\'utente non è registrato nello shop.',
                    flags: MessageFlags.Ephemeral,
                });
            }
            await interaction.editReply({
                content: `Il saldo token di ${user.tag} è stato impostato a ${amount}.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error('Errore durante l\'impostazione dei token:', error);
            await interaction.editReply({
                content: 'Si è verificato un errore durante l\'impostazione dei token.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};