const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { wsRemove } = require('../../managers/fivemManager.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ws-remove')
        .setDescription('Revoca l\'accesso al pannello admin.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const discordId = user.id;
        try {
            const res = wsRemove(discordId);
            if(res) {
                await interaction.editReply({ content: `A ${user.username} è stato dato revocato al pannello admin!`, flags: MessageFlags.Ephemeral });
            } else {
                await interaction.editReply({ content: `Errore nell\'operazione di rimozione di ${user.username} dal pannello`, flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            logger.error(`Errore durante l'esecuzione di ws-add: ${error.message}`);
            await interaction.editReply({ content: 'Si è verificato un errore durante l\'esecuzione del comando.', flags: MessageFlags.Ephemeral });
        }
    },
};