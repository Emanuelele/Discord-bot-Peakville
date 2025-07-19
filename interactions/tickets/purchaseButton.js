const { ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createTicket, hasOpenTicket } = require('../../managers/ticketsManager');
require('dotenv').config();

module.exports = {
    name: 'purchase_ticket',
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const categoryId = process.env.TICKETS_PURCHASE_CATEGORY;
        const guild = interaction.guild;
        const member = interaction.member;
        const category = guild.channels.cache.get(categoryId);
        try {
            if (!member.roles.cache.has(process.env.ALLOWLIST_ROLE)) {
                return interaction.editReply({
                    content: `Non hai i permessi per aprire questo tipo di ticket.`,
                    flags: MessageFlags.Ephemeral
                });
            }
            const alreadyHasTicket = await hasOpenTicket(member.id);
            if (alreadyHasTicket >= process.env.MAX_TICKETS) {
                return interaction.editReply({
                    content: `Hai già ${alreadyHasTicket} ticket aperti!`,
                    flags: MessageFlags.Ephemeral,
                });
            }
            const channel = await guild.channels.create({
                name: `Ticket-Donazione-${interaction.user.username}`,
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