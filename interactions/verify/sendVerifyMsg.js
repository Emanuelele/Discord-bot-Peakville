const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
require('dotenv').config();
const { getAttempts, incrementAttempts } = require('../../managers/verifyManager');

module.exports = {
    name: 'sendVerifyMsg',
    async execute(interaction, client) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            if (client.inVerification.has(interaction.user.id)) {
                return interaction.editReply({ content: 'Hai già una verifica in corso. Riprova più tardi.' });
            }

            const member = interaction.guild.members.cache.get(interaction.user.id);
            const attempts = await getAttempts(interaction.user.id);
            if (attempts >= 3) {
                return interaction.editReply({ content: 'Hai superato il limite di tentativi. Potrai riprovare tra 24 ore.' });
            }

            if (member.roles.cache.has(process.env.VERIFY_ROLE)) {
                return interaction.editReply({ content: 'Hai già il ruolo di verifica!' });
            }

            const captchaFolder = path.join(__dirname, '../../captchas');
            const files = fs.readdirSync(captchaFolder).filter(file => file.endsWith('.webp'));

            if (files.length === 0) {
                return interaction.editReply({
                    content: 'Nessun CAPTCHA disponibile al momento. Riprova più tardi.',
                });
            }

            const randomFile = files[Math.floor(Math.random() * files.length)];
            const solution = path.parse(randomFile).name;
            const filePath = path.join(captchaFolder, randomFile);

            let userInput = '';

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Verifica richiesta')
                .setDescription(`Inserisci la sequenza numerica visualizzata nell'immagine usando il tastierino.\n\nInput attuale: **${userInput}**`)
                .setImage('attachment://captcha.webp')
                .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
                .setTimestamp()
                .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });

            const rows = [];
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            for (let i = 0; i < 3; i++) {
                rows.push(
                    new ActionRowBuilder().addComponents(
                        numbers.slice(i * 3, (i + 1) * 3).map(num =>
                            new ButtonBuilder()
                                .setCustomId(`num_${num}`)
                                .setLabel(num.toString())
                                .setStyle(ButtonStyle.Secondary)
                        )
                    )
                );
            }

            rows.push(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('clear')
                        .setLabel('❌')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('num_0')
                        .setLabel('0')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('confirm')
                        .setLabel('✅')
                        .setStyle(ButtonStyle.Success)
                )
            );

            client.inVerification.add(interaction.user.id);

            const message = await interaction.editReply({
                embeds: [embed],
                files: [{ attachment: filePath, name: 'captcha.webp' }],
                components: rows,
                flags: MessageFlags.Ephemeral,
            });

            const collector = message.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 60000,
            });
            

            let confirmed = false;

            collector.on('collect', async i => {
                try {
                    if (i.customId.startsWith('num_')) {
                        const num = i.customId.split('_')[1];
                        userInput += num;

                        embed.setDescription(`Inserisci la sequenza numerica visualizzata nell'immagine usando il tastierino.\n\nInput attuale: **${userInput}**`);
                        await i.update({ embeds: [embed], components: rows });
                    } else if (i.customId === 'clear') {
                        userInput = '';
                        embed.setDescription(`Inserisci la sequenza numerica visualizzata nell'immagine usando il tastierino.\n\nInput attuale: **${userInput}**`);
                        await i.update({ embeds: [embed], components: rows });
                    } else if (i.customId === 'confirm') {
                        confirmed = true;

                        if (userInput === solution) {
                            await member.roles.add(process.env.VERIFY_ROLE);
                            await i.reply({
                                content: '✅ Verifica completata con successo!',
                                flags: MessageFlags.Ephemeral,
                                embeds: [],
                                components: [],
                                files: [],
                            });
                        } else {
                            await incrementAttempts(interaction.user.id);
                            await i.reply({
                                content: '❌ Soluzione errata. Riprova!',
                                flags: MessageFlags.Ephemeral,
                                embeds: [],
                                components: [],
                                files: [],
                            });
                        }
                        collector.stop();
                    }
                } catch (error) {
                    console.error('Errore durante la raccolta dell\'interazione:', error);
                }
            });

            collector.on('end', async () => {
                client.inVerification.delete(interaction.user.id);
                if (!confirmed) {
                    try {
                        await interaction.editReply({
                            content: '⏰ Tempo scaduto. Riprova la verifica.',
                            embeds: [],
                            components: [],
                            files: [],
                        });
                        await incrementAttempts(interaction.user.id);
                    } catch (err) {
                        console.error('Errore nel messaggio di fine verifica:', err);
                    }
                }
            });

        } catch (error) {
            console.error('Errore in sendVerifyMsg:', error);
            await interaction.editReply({
                content: 'Si è verificato un errore durante la verifica. Riprova più tardi.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
