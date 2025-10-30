const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');

const ROLE_TO_ADD = '1359565375397826710';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeruolo')
        .setDescription('Rimuove un ruolo specifico da un utente definito.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const guild = interaction.guild;
            if (!guild) {
                await interaction.editReply({
                    content: 'Questo comando può essere eseguito solo in un server.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            const members = await guild.members.fetch({ force: true });
            const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
            let addedCount = 0;

            for (const member of members.values()) {
                const accountAge = Date.now() - member.user.createdTimestamp;
                
                if (accountAge >= oneYearInMs && !member.roles.cache.has(ROLE_TO_ADD)) {
                    await member.roles.add(ROLE_TO_ADD);
                    addedCount++;
                    logger.info(`✅ Ruolo ${ROLE_TO_ADD} aggiunto a ${member.user.tag}`);
                }
            }

            await interaction.editReply(`✅ Ruolo aggiunto a ${addedCount} utenti con account più vecchio di 1 anno.`);
        } catch (error) {
            logger.error(error);
            await interaction.editReply("❌ Errore durante l'aggiunta del ruolo.");
        }
    },
};