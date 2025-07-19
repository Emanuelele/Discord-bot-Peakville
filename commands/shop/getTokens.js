const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getTokens } = require('../../managers/shopManager');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('gettokens')
        .setDescription('Mostra il saldo token di un utente sullo shop')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente di cui vuoi controllare il saldo token')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        try {
            const result = await getTokens(user.id);
            if (!result) {
                return interaction.editReply({
                    content: 'L\'utente non è registrato nello shop.',
                    flags: MessageFlags.Ephemeral,
                });
            }
            await interaction.editReply({
                content: `Il saldo token di ${user.tag} è di ${result} token.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error('Errore durante il recupero dei token:', error);
            await interaction.editReply({
                content: 'Si è verificato un errore durante il recupero dei token.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};