const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const db = require('../../utils/database.js');
const logger = require('../../utils/loggers.js');
const { checkBackgroundRecord } = require('../../managers/backgroundsManager.js')
module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Allowlist')
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {

        const user = interaction.targetUser;
        const discordId = user.id;
        const executor = interaction.user.id;
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const approvedBackground = await getApprovedBackground(client, discordId);

            if (!approvedBackground) {
                return await interaction.editReply({ 
                    content: `L'utente non ha un background approvato`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const existingRecord = await findExistingAllowlistRecord(discordId);

            if (existingRecord) {
                await interaction.editReply({ 
                    content: `L'utente è già allowlistato`, 
                    flags: MessageFlags.Ephemeral 
                });
            } else {
                await createAllowlistRecord(discordId, executor);
                await interaction.editReply({ 
                    content: `Nuovo record creato:\n**Discord ID**: ${discordId}`, 
                    flags: MessageFlags.Ephemeral 
                });
            }

            await updateMemberRoles(interaction, discordId);

        } catch (error) {
            logger.error(`Errore nel database: ${error}`);
            await interaction.editReply({ content: 'Errore durante la registrazione dell\'associazione.', flags: MessageFlags.Ephemeral });
        }
    },
};

/**
 * Recupera il background approvato di un utente.
 * @param {Object} client - Istanza del client Discord
 * @param {string} discordId - ID Discord dell'utente
 * @returns {Object|null} Background approvato o null se non esiste
 */
async function getApprovedBackground(client, discordId) {
    const backgrounds = await checkBackgroundRecord(discordId);
    return backgrounds.find(bg => bg.type === 'approved') || null;
}

/**
 * Trova un record esistente nella tabella allowlist.
 * @param {string} discordId - ID Discord
 * @returns {Object|null} Record esistente o null se non trovato
 */
async function findExistingAllowlistRecord(discordId) {
    const [results] = await db.pool.query(
        'SELECT * FROM allowlist WHERE discord_id = ?',
        [discordId]
    );
    return results.length > 0 ? results[0] : null;
}

/**
 * Crea un nuovo record nella tabella allowlist.
 * @param {string} discordId - ID Discord
 * @param {string} executor - executor
 */

async function createAllowlistRecord(discordId, executor) {
    await db.pool.execute(
        'INSERT INTO allowlist (discord_id, executor) VALUES (?, ?)',
        [discordId, executor]
    );
}

/**
 * Aggiorna i ruoli di un membro del server Discord.
 * @param {Object} interaction - Oggetto interazione Discord
 * @param {string} discordId - ID Discord
 */
async function updateMemberRoles(interaction, discordId) {
    const removeRoles = [process.env.REMAND_ROLE, process.env.BG_DENIDED_ROLE, process.env.BG_APPROVED_ROLE];
    const allowlistRole = process.env.ALLOWLIST_ROLE;

    const member = await interaction.guild.members.fetch(discordId);

    if (!member) {
        throw new Error('Utente non trovato nel server.');
    }

    await member.roles.remove(removeRoles);
    await member.roles.add(allowlistRole);

    await interaction.followUp({ content: 'Ruoli aggiornati con successo.', flags: MessageFlags.Ephemeral });
}