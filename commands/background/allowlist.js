const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const db = require('../../utils/database.js');
const logger = require('../../utils/loggers.js');
const { checkBackgroundRecord } = require('../../managers/backgroundsManager.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allowlist')
        .setDescription('Inserisce un ID Discord nella whitelist.')
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
        const executor = interaction.user.id;

        try {
            const member = await interaction.guild.members.fetch(executor);
            const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
            if (!isAdmin) {
                const approvedBackground = await getApprovedBackground(client, discordId);
                if (!approvedBackground) {
                    return await interaction.editReply({ 
                        content: `L'utente non ha un background approvato`, 
                        flags: MessageFlags.Ephemeral 
                    });
                }
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
    const [results] = await db.query(
        'SELECT * FROM allowlist WHERE discord_id = ?',
        [discordId]
    );
    return results.length > 0 ? results[0] : null;
}

/**
 * Crea un nuovo record nella tabella allowlist.
 * @param {string} discordId - ID Discord
 */
async function createAllowlistRecord(discordId, executor) {
    await db.execute(
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
    const removeRoles = [process.env.REMAND_ROLE_1, process.env.REMAND_ROLE_2, process.env.REMAND_ROLE_3, process.env.BG_APPROVED_ROLE];
    const allowlistRole = process.env.ALLOWLIST_ROLE;
    let member;
    member = await interaction.guild.members.fetch(discordId);

    if (!member) {
        throw new Error('Utente non trovato nel server.');
    }

    await member.roles.remove(removeRoles);
    await member.roles.add(allowlistRole);

    await interaction.followUp({ content: 'Ruoli aggiornati con successo.', flags: MessageFlags.Ephemeral });
}