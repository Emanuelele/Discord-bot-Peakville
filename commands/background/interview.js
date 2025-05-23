const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
require('dotenv').config();
const DEFAULT_VOICE_CHANNEL_ID = process.env.WHITELIST_WAIT_CHANNEL;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interview')
        .setDescription('Sposta l\'utente con il maggior tempo nel canale vocale corrente nello stesso canale dello staffer')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const stafferMember = interaction.member;
        if (!stafferMember.voice.channel) {
            return await interaction.editReply({ content: 'Devi essere in un canale vocale per usare questo comando!', flags: MessageFlags.Ephemeral });
        }

        const defaultChannel = interaction.guild.channels.cache.get(DEFAULT_VOICE_CHANNEL_ID);
        if (!defaultChannel) {
            return await interaction.editReply({ content: 'Il canale attesa whitelist non è valido o non esiste.', flags: MessageFlags.Ephemeral });
        }


         const membersInChannel = defaultChannel.members.filter(member => member.voice.channel && member.voice.channel.id === defaultChannel.id);

         if (membersInChannel.size === 0) {
             return await interaction.editReply({ content: 'Non ci sono membri nel canale attesa whitelist da spostare.', flags: MessageFlags.Ephemeral });
         }
 
         let oldestMember = null;
         let oldestTimestamp = Infinity;
         membersInChannel.forEach(member => {
             const joinInfo = client.joinWaitingWl.get(member.id);
             if (joinInfo && joinInfo.channelId === defaultChannel.id && joinInfo.joinTimestamp < oldestTimestamp) {
                 oldestMember = member;
                 oldestTimestamp = joinInfo.joinTimestamp;
             }
         });
 
         if (!oldestMember) {
             return await interaction.editReply({ content: 'Non ci sono membri nel canale attesa whitelist da spostare.', flags: MessageFlags.Ephemeral });
         }

        try {
            await oldestMember.voice.setChannel(stafferMember.voice.channel);

            interaction.editReply({ content: `Il membro ${oldestMember.user.tag} è stato spostato nel tuo canale vocale!`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'C\'è stato un errore nel spostare il membro.', flags: MessageFlags.Ephemeral });
        }
    },
};
