const { ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createTicket, hasOpenTicket } = require('../../managers/ticketsManager');
const ticketConfig = require('../../config/tickets.json');
require('dotenv').config();

module.exports = {
    name: ticketConfig.selectMenu.customId,
    async execute(interaction, client) {
        // Rimuoviamo il menu a tendina per evitare spam
        await interaction.update({
            content: 'Creazione del ticket in corso...',
            components: []
        });

        const selectedTopic = interaction.values[0];
        const config = ticketConfig.selectMenu.options.find(opt => opt.value === selectedTopic);

        if (!config) {
            return interaction.followUp({
                content: 'Configurazione ticket non trovata.',
                flags: MessageFlags.Ephemeral
            });
        }

        const categoryId = config.categoryId;
        const guild = interaction.guild;
        const member = interaction.member;
        const category = guild.channels.cache.get(categoryId);

        try {
            if (config.allowedRoles && config.allowedRoles.length > 0) {
                const hasPermission = config.allowedRoles.some(roleId => {
                    return member.roles.cache.has(roleId);
                });

                if (!hasPermission) {
                    return interaction.followUp({
                        content: `Non hai i permessi per aprire questo tipo di ticket.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            const alreadyHasTicket = await hasOpenTicket(member.id);
            if (alreadyHasTicket >= process.env.MAX_TICKETS) {
                return interaction.followUp({
                    content: `Hai già ${alreadyHasTicket} ticket aperti!`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            const channel = await guild.channels.create({
                name: `${config.namePrefix}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                topic: member.id,
                parent: categoryId,
                permissionOverwrites: [
                    ...(category ? category.permissionOverwrites.cache.map(overwrite => ({
                        id: overwrite.id,
                        allow: overwrite.allow,
                        deny: overwrite.deny,
                    })) : []),
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
                .setDescription(`Ciao ${member}, presto un membro dello ${'<@&' + ticketConfig.staffRoleId + '>'} sarà da te!`)
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

            if (config.extraMessage) {
                const formattedMessage = config.extraMessage.replace(/{member}/g, member.toString());
                const messageOptions = { content: formattedMessage };

                if (config.suppressEmbeds) {
                    messageOptions.flags = [MessageFlags.SuppressEmbeds];
                }

                await channel.send(messageOptions);
            }

            await createTicket(member.id);

            await interaction.editReply({
                content: `Il tuo ticket è stato creato: ${channel.toString()}`,
                components: []
            });

        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: 'Errore durante la creazione del ticket.', flags: MessageFlags.Ephemeral });
        }
    }
}
