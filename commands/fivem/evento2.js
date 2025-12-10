const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');

const TARGET_USER_ID = '459706350386282497';      // Utente a cui assegnare il ruolo
const ROLE_TO_ADD = '1236705093282299905';        // Ruolo da assegnare

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeruolo')
        .setDescription('Assegna un ruolo specifico a un utente specifico.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const guild = interaction.guild;
            if (!guild) {
                return await interaction.editReply({
                    content: '❌ Questo comando può essere eseguito solo in un server.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            // Recupera ruolo e utente
            const roleToAdd = await guild.roles.fetch(ROLE_TO_ADD);
            const targetMember = await guild.members.fetch(TARGET_USER_ID).catch(() => null);

            if (!roleToAdd) {
                return await interaction.editReply({
                    content: '❌ Il ruolo specificato non è stato trovato.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            if (!targetMember) {
                return await interaction.editReply({
                    content: '❌ L’utente specificato non è presente nel server.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            try {
                await targetMember.roles.remove(roleToAdd);
            } catch (err) {
                logger.error(`Errore assegnando il ruolo a ${targetMember.user.tag}: ${err.message}`);
                return await interaction.editReply({
                    content: '❌ Errore durante l’assegnazione del ruolo.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            logger.info(`Ruolo ${roleToAdd.name} assegnato a ${targetMember.user.tag}.`);
            await interaction.editReply({
                content: `✅ Ruolo **${roleToAdd.name}** assegnato a **${targetMember.user.tag}**.`,
                flags: MessageFlags.Ephemeral,
            });

        } catch (error) {
            logger.error(error);
            await interaction.editReply({
                content: '❌ Errore durante l’esecuzione del comando.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
