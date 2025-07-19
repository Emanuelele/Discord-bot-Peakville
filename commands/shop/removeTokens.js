const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { removeTokens } = require('../../managers/shopManager');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('removetokens')
        .setDescription('Rimuovi token a un utente sullo shop')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente a cui rimuovere token sul sito')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Numero di token da rimuovere')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        try {
            const result = await removeTokens(user.id, amount);
            if (!result) {
                return interaction.editReply({
                    content: 'L\'utente non è registrato nello shop.',
                    flags: MessageFlags.Ephemeral,
                });
            }
            await interaction.editReply({
                content: `Sono stati rimossi ${amount} token a ${user.tag}.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error('Errore durante la rimozione dei token:', error);
            await interaction.editReply({
                content: 'Si è verificato un errore durante la rimozione dei token.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};