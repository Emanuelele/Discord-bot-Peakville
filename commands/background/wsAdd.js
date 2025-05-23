const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { wsAdd } = require('../../managers/fivemManager.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ws-add')
        .setDescription('Concede l\'accesso al pannello admin.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('staff')
                .setDescription('Aggiunge un utente alla lista Staff del pannello.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Tagga l\'utente da aggiungere alla whitelist Staff.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('admin')
                .setDescription('Aggiunge un utente alla lista Admin del pannello.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Tagga l\'utente da aggiungere alla whitelist Admin.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('superadmin')
                .setDescription('Aggiunge un utente alla lista Superadmin del pannello.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Tagga l\'utente da aggiungere alla whitelist Superadmin.')
                        .setRequired(true)
                )
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const discordId = user.id;
        try {
            let roleType = subcommand;
            const res = wsAdd(discordId, roleType);
            if(res) {
                await interaction.editReply({ content: `A ${user.username} è stato dato l'accesso al pannello admin con ruolo ${roleType}!`, flags: MessageFlags.Ephemeral });
            } else {
                await interaction.editReply({ content: `Il ruolo di ${user.username} è stato correttamente aggiornato! (nuovo ruolo: ${roleType})`, flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            logger.error(`Errore durante l'esecuzione di ws-add: ${error.message}`);
            await interaction.editReply({ content: 'Si è verificato un errore durante l\'esecuzione del comando.', flags: MessageFlags.Ephemeral });
        }
    },
};
