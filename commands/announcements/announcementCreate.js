const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const { createAnnouncement, executeAnnouncement } = require('../../managers/announcementsManager');
const scheduleInterface = require('../../interactions/announcements/create/scheduleInterface');

function isValidHexColor(color) {

    const trimmedColor = color.trim().toLowerCase();

    const hexPattern = /^#([0-9a-f]{6})$/;

    return hexPattern.test(trimmedColor);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcement-create')
        .setDescription('Crea un nuovo annuncio ricorrente.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Il canale dove inviare l\'annuncio')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('title')
                .setDescription('Titolo del messaggio')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('message')
                .setDescription('Il contenuto del messaggio')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('color') 
                .setDescription('Colore dell\'embed (es. #F9F4D8)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const message = interaction.options.getString('message');
        const color = interaction.options.getString('color');

        if(!isValidHexColor(color)) {
            return interaction.editReply({
                content: 'Per favore, inserisci il colore in formato hex valido.',
                flags: MessageFlags.Ephemeral
            });
        }
        
        await scheduleInterface.execute(interaction, interaction.client);

        interaction.client.once('scheduleConfigured', async ({ hours, minutes, selectedDays }) => {
            try {
                let scheduleValue;
                const dayMapping = {
                    lun: 1,
                    mar: 2,
                    mer: 3,
                    gio: 4,
                    ven: 5,
                    sab: 6,
                    dom: 0,
                };
                const daysValue = selectedDays.length > 0 ? 
                    selectedDays.map(day => dayMapping[day.toLowerCase()]).join(',') : 
                '*';
                scheduleValue = `${minutes || 0} ${hours || 0} * *`;

                await createAnnouncement(channel.id, title, message, scheduleValue, daysValue, color);

                const announcement = {
                    channel_id: channel.id,
                    title: title,
                    message: message,
                    schedule_value: scheduleValue,
                    days_value: daysValue,
                    color: color
                };
                const cronExpression = `0 ${announcement.schedule_value} ${announcement.days_value}`;

                const { CronJob } = require('cron');
                const job = new CronJob(cronExpression, () => {
                    executeAnnouncement(client, announcement);
                });
                job.start();



                await interaction.followUp({
                    content: `Annuncio creato con successo!\nCanale: ${channel}\nMessaggio: ${message}\nValore: ${scheduleValue}\nGiorni: ${selectedDays.join(', ') || 'Tutti'}\nColor: ${color}`,
                    flags: MessageFlags.Ephemeral
                });
            } catch (error) {
                console.error('Errore nella creazione dell\'annuncio:', error);
                await interaction.followUp({
                    content: 'Si è verificato un errore durante la creazione dell\'annuncio.',
                    flags: MessageFlags.Ephemeral
                });
            }
        });
    }
};
