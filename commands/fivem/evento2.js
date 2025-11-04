const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');

const ROLE_TO_MOVE = '1236705093282299905'; // Ruolo da spostare
const ROLE_REFERENCE = '1136364252349870211'; // Ruolo sopra cui posizionarlo

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeruolo')
        .setDescription('Sposta un ruolo sopra un altro nella gerarchia.')
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

            const roleToMove = await guild.roles.fetch(ROLE_TO_MOVE);
            const roleReference = await guild.roles.fetch(ROLE_REFERENCE);

            if (!roleToMove || !roleReference) {
                return await interaction.editReply({
                    content: '❌ Uno dei ruoli specificati non è stato trovato.',
                    flags: MessageFlags.Ephemeral,
                });
            }

            // Imposta la posizione del ruolo da spostare subito sopra al riferimento
            await roleToMove.setPosition(roleReference.position);

            logger.info(`🔼 Ruolo ${roleToMove.name} spostato sopra ${roleReference.name} nella gerarchia.`);
            await interaction.editReply({
                content: `✅ Il ruolo **${roleToMove.name}** è stato spostato sopra **${roleReference.name}** nella gerarchia.`,
                flags: MessageFlags.Ephemeral,
            });

        } catch (error) {
            logger.error(error);
            await interaction.editReply({
                content: '❌ Errore durante lo spostamento del ruolo.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
