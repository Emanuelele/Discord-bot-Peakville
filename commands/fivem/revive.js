const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('revive')
        .setDescription('Rianima un giocatore sul server FiveM.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente da rianimare')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        try {
            const targetUser = interaction.options.getUser('user');
            const guild = interaction.guild;
            const roleId = '1236705093282299905';
            const exemptUserId = '279374565308628992';

            // Defer la risposta per avere più tempo
            await interaction.deferReply({ ephemeral: true });

            // Ottieni il ruolo
            const role = guild.roles.cache.get(roleId);
            if (!role) {
                return await interaction.editReply({
                    content: `❌ Ruolo con ID ${roleId} non trovato nel server.`
                });
            }

            // Trova tutti i membri con il ruolo specificato
            const membersWithRole = role.members;
            let removedCount = 0;
            let errors = [];

            // Rimuovi il ruolo da tutti tranne l'utente esentato
            for (const [memberId, member] of membersWithRole) {
                // Salta l'utente esentato
                if (memberId === exemptUserId) {
                    continue;
                }

                try {
                    await member.roles.remove(role);
                    removedCount++;
                    logger.info(`Ruolo ${role.name} rimosso da ${member.user.tag} (${memberId})`);
                } catch (error) {
                    logger.error(`Errore rimuovendo ruolo da ${member.user.tag}: ${error.message}`);
                    errors.push(`${member.user.tag}: ${error.message}`);
                }
            }

            // Prepara il messaggio di risposta
            let responseMessage = `✅ **Comando Revive eseguito per ${targetUser.tag}**\n\n`;
            responseMessage += `🔄 Ruolo \`${role.name}\` rimosso da **${removedCount}** membri`;
            
            if (exemptUserId && guild.members.cache.has(exemptUserId)) {
                const exemptMember = guild.members.cache.get(exemptUserId);
                responseMessage += `\n🛡️ Utente esentato: ${exemptMember.user.tag}`;
            }

            if (errors.length > 0) {
                responseMessage += `\n\n⚠️ **Errori (${errors.length}):**\n`;
                responseMessage += errors.slice(0, 5).map(err => `• ${err}`).join('\n');
                if (errors.length > 5) {
                    responseMessage += `\n• ... e altri ${errors.length - 5} errori`;
                }
            }

            await interaction.editReply({
                content: responseMessage
            });

        } catch (error) {
            logger.error(`Errore nel comando revive: ${error.message}`);
            
            const errorMessage = interaction.deferred || interaction.replied 
                ? { content: `❌ Errore durante l'esecuzione del comando: ${error.message}` }
                : { content: `❌ Errore durante l'esecuzione del comando: ${error.message}`, ephemeral: true };

            if (interaction.deferred) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};