const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const db = require('../../utils/database.js');
const logger = require('../../utils/loggers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wipe')
        .setDescription('Wipa un player sul server Fivem.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');

        //To-do: interazione con il db e cancellazione righe.
        //Need: copia struttura db di peakville e lista colonne da manipolare

        await interaction.editReply({ content: `Giocatore ${user} wipato con successo`, flags: MessageFlags.Ephemeral });
    },
};