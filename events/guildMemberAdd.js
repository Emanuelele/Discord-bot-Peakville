const { EmbedBuilder } = require('discord.js');
const { createLog } = require('../managers/fivemManager');
require('dotenv').config();

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const metadata = {
                "executor": member.user.id
            }
            await createLog("PLAYER_JOIN_DISCORD", metadata);
            const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
            if (!channel) return;
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Benvenuto nel nostro server! 🎉')
                .setDescription(`Ciao <@${member.user.id}>, siamo felici di averti con noi!`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '🎈 Qualche consiglio:', value: 'Leggi il regolamento e presentati nella chat apposita.' },
                    { name: '🛠️ Aiuto:', value: 'Se hai bisogno di supporto, non esitare a contattare il nostro staff!' }
                )
                .setFooter({
                    text: `Un caloroso benvenuto da parte di tutto il team!`,
                    iconURL: member.guild.iconURL({ dynamic: true }),
                })
                .setTimestamp();

            await channel.send({ content: `Benvenuto/a ${member}!`, embeds: [welcomeEmbed] });
        } catch (error) {
            console.error(`Errore nell'invio del messaggio di benvenuto: ${error}`);
        }
    },
};
