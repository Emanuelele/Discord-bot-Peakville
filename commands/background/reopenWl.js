const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { reopenWl } = require('../../managers/backgroundsManager');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reopen-wl')
        .setDescription('Riapre le whitelist per chi è stato rimandato.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            const roleIdsToRemove = [
                process.env.REMAND_ROLE_1,
                process.env.REMAND_ROLE_2,
                process.env.REMAND_ROLE_3,
            ];
            const guild = interaction.guild;
            if (!guild) {
                await interaction.editReply({
                    content: 'Questo comando può essere eseguito solo in un server.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            await interaction.deferReply({
                content: 'Rimozione dei ruoli in corso, attendere prego...',
                flags: MessageFlags.Ephemeral,
            });

            const members = await guild.members.fetch();

            for (const member of members.values()) {
                for (const roleId of roleIdsToRemove) {
                    if (member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId).catch(err =>
                            console.error(`Impossibile rimuovere il ruolo ${roleId} da ${member.user.tag}:`, err)
                        );
                    }
                }
            }

            await interaction.editReply({
                content: 'Ruoli rimossi con successo da tutti i membri.',
            });

            await reopenWl();
        } catch (error) {
            console.error('Errore durante l\'esecuzione del comando reopen-wl:', error);
            await interaction.editReply({
                content: 'Si è verificato un errore durante l\'esecuzione del comando.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};