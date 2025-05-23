const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { getAndIncrementRemandCount, applySuspension, applyPermanentSuspension, updateSuspensionStatus } = require('../../managers/backgroundsManager.js');
require('dotenv').config();

const WAITING_VOICE_CHANNEL_ID = '123456789012345678';

function parseTime(timeString) {
    const regex = /^(\d+)(m|h|d|w)$/i;
    const match = timeString.match(regex);
    if (!match) {
        return null;
    }

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'd':
            return value * 24 * 60 * 60 * 1000;
        case 'w':
            return value * 7 * 24 * 60 * 60 * 1000;
        default:
            return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remand')
        .setDescription('Rimanda un utente dal colloquio e applica il ruolo corrispondente di rimando.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('L\'utente da rimandare')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Tempo di sospensione (formato: 1m, 1h, 1d, 1w), valido solo per i primi 2 rimandi')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const suspensionTime = interaction.options.getString('time');
        const member = await interaction.guild.members.fetch(user.id);

        const suspensionDuration = parseTime(suspensionTime);
        if (!suspensionDuration) {
            return interaction.editReply({ content: 'Il formato del tempo non è valido. Usa 1m, 1h, 1d o 1w.', flags: MessageFlags.Ephemeral });
        }
        
        const remandCount = await getAndIncrementRemandCount(user.id);
        if(remandCount > 3) return interaction.editReply({ content: `${user.tag} ha già raggiunto il limite massimo di rimandi.`, flags: MessageFlags.Ephemeral });

        const role = interaction.guild.roles.cache.get(process.env[`REMAND_ROLE_${remandCount}`]);
        if (role) {
            await member.roles.add(role);
        }

        if (remandCount >= 1 && remandCount < 3) {
            const suspensionEnd = await applySuspension(user.id, suspensionDuration);
            await member.voice.setChannel(null);
            return interaction.editReply({ content: `${user.tag} è stato rimandato ${remandCount} volta/e e la sua sospensione terminerà il ${new Date(suspensionEnd).toLocaleString()}.`, flags: MessageFlags.Ephemeral });
        }
        if (remandCount == 3) {
            await applyPermanentSuspension(user.id);
            await member.voice.setChannel(null); 
            return interaction.editReply({ content: `${user.tag} ha raggiunto il limite di rimandi e ora è sospeso permanentemente.`, flags: MessageFlags.Ephemeral });
        }

        return interaction.editReply({ content: `${user.tag} è stato rimandato per la prima volta. Non ci sarà sospensione per ora.`, flags: MessageFlags.Ephemeral });
    }
};
