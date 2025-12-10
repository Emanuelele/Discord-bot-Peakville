const { ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createTicket, hasOpenTicket } = require('../../managers/ticketsManager');
require('dotenv').config();

module.exports = {
    name: 'activity_ticket',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const categoryId = process.env.TICKETS_ACTIVITY_CATEGORY;
        const guild = interaction.guild;
        const member = interaction.member;
        const category = guild.channels.cache.get(categoryId);
        try {
            if (!member.roles.cache.has(process.env.BG_APPROVED_ROLE) && !member.roles.cache.has(process.env.ALLOWLIST_ROLE)) {
                return interaction.editReply({
                    content: `Non hai i permessi per aprire questo tipo di ticket.`,
                    flags: MessageFlags.Ephemeral
                });
            }
            
            const alreadyHasTicket = await hasOpenTicket(member.id);
            if (alreadyHasTicket >= 1) {
                return interaction.editReply({
                    content: `Hai già ${alreadyHasTicket} ticket aperti!`,
                    flags: MessageFlags.Ephemeral,
                });
            }
            const channel = await guild.channels.create({
                name: `Ticket-Fazioni-${interaction.user.username}`,
                type: ChannelType.GuildText,
                topic: member.id,
                parent: categoryId,
                permissionOverwrites:
                [
                    ...category.permissionOverwrites.cache.map(overwrite => ({
                        id: overwrite.id,
                        allow: overwrite.allow,
                        deny: overwrite.deny,
                    })),
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel, 
                            PermissionFlagsBits.SendMessages, 
                            PermissionFlagsBits.AttachFiles
                        ],
                    }
                ]
            });

            const embed = new EmbedBuilder()
                .setTitle('Ticket Support')
                .setDescription(`Ciao ${member}, presto un membro dello ${'<@&' + process.env.STAFF_ROLE_ID +'>'} sarà da te!`)
                .setColor(0x00AE86)
                .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
                .setTimestamp()
                .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });

            const closeButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Chiudi Ticket')
                .setStyle(ButtonStyle.Danger);

            const actionRow = new ActionRowBuilder().addComponents(closeButton);
            await channel.send({ embeds: [embed], components: [actionRow] });
            await channel.send(`
Ciao ${member}!

*Ricorda che prima di procedere con la creazione della tua banda criminale, è necessario che **tutti **i membri abbiano un background approvato dallo staff.*

Per essere riconosciuti ufficialmente come **banda criminale**, è necessario fornire alcune informazioni fondamentali. Ti invitiamo a compilare quanto segue nel ticket:

:one: **Origine della fazione**  
   Breve descrizione di come è nata la banda, storia e motivazioni.

:two: **Obiettivi**  
   Gli obiettivi e gli scopi della banda.

:three: **Divisione dei ruoli**  
   Indicare chi ricopre quale ruolo all’interno della banda. Ad esempio:

   - Presidente
   - Vice Presidente
   - Sergente in Armi
   - Segretario
   - Enforcer
   - Boia
   - Prospect

:four: **Modus Operandi**  
   Come la banda prende decisioni, interazioni tra membri, approccio verso le forze dell’ordine, eventuali regole interne.

:pushpin: **Regole importanti**  
- Massimo **6 membri** per banda, tutti devono essere presenti nel ticket.  
- Le alleanze tra bande **non sono consentite**.  
- Nessun membro della banda può possedere direttamente un’attività, è possibile usare prestanome esterni.  
- Essere riconosciuti come banda criminale permette al leader di ottenere lo status di **Criminale Affermato**, con strumenti unici in-game.

*Una volta inviati tutti i dettagli, lo staff valuterà la tua richiesta e, se approvata, la banda sarà riconosciuta ufficialmente.*
`);
            await createTicket(member.id);
            await interaction.editReply({
                content: `Il tuo ticket è stato creato: ${channel.toString()}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Errore durante la creazione del ticket.', flags: MessageFlags.Ephemeral });
        }
    }
}