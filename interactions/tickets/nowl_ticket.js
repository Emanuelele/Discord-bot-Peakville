const { ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createTicket, hasOpenTicket } = require('../../managers/ticketsManager');
require('dotenv').config();

module.exports = {
    name: 'nowl_ticket',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const categoryId = process.env.TICKETS_NOWL_CATEGORY;
        const guild = interaction.guild;
        const member = interaction.member;
        const category = guild.channels.cache.get(categoryId);
        try {
            const alreadyHasTicket = await hasOpenTicket(member.id);
            if (alreadyHasTicket >= process.env.MAX_TICKETS) {
                return interaction.editReply({
                    content: `Hai già ${alreadyHasTicket} ticket aperti!`,
                    flags: MessageFlags.Ephemeral,
                });
            }
            const channel = await guild.channels.create({
                name: `Ticket-Shop-${interaction.user.username}`,
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
            await channel.send(`Ciao ${member}, grazie per aver scelto di **sostenere il progetto!** Per riscattare le ricompense sul [sito](https://shop.peakville.it) sarà necessario ottenere dei **PeakPoints** <:PeakPoints:1446933990882672710>.
Se hai deciso di ottenerne tramite donazione, i pacchetti di <:PeakPoints:1446933990882672710> attualmente disponibili sono:
- 5€ ⟶ 500 <:PeakPoints:1446933990882672710>  
- 15€ ⟶ 1500 <:PeakPoints:1446933990882672710> + 50 BONUS
- 50€ ⟶ 5000 <:PeakPoints:1446933990882672710> + 250 BONUS

Sarà possibile acquistare più pacchetti contemporaneamente, basterà scriverlo nella richiesta di questo ticket!
Per convertire il saldo in PeakPoints, basterà inviare la somma desiderata al seguente [PayPal](https://www.paypal.com/paypalme/peakville1970), come amici e familiari, ed inviare uno screenshot della ricevuta nella seguente chat testuale come conferma.

*Qualsiasi donazione di somma diversa da quanto riportato, sarà considerata come donazione libera, non convertibile in PeakPoints. Non sarà possibile effettuare rimborsi, pensaci bene! Grazie da parte di tutto lo Staff!* <:peakheart:1369719184321413230>`);
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