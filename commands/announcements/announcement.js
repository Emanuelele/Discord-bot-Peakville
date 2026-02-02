const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, MessageFlags } = require('discord.js');

function isValidHexColor(color) {

    const trimmedColor = color.trim().toLowerCase();

    const hexPattern = /^#([0-9a-f]{6})$/;

    return hexPattern.test(trimmedColor);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('Crea un nuovo annuncio')
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
        .addStringOption(option =>
            option.setName('test')
                .setDescription('test')
                .setRequired(true)
                .addChoices(
                    { name: 'Funny', value: 'gif_funny' },
                    { name: 'Meme', value: 'gif_meme' },
                    { name: 'Movie', value: 'gif_movie' },
                ))
        .addBooleanOption(option => 
            option.setName("ping").setDescription("Tagga tutti")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral })
            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const message = interaction.options.getString('message').replace(/\\n/g, '\n');
            const color = interaction.options.getString('color');

            const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(color)
            .setDescription(message)
            .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
            .setTimestamp()
            .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });

            if(!isValidHexColor(color)) {
                return await interaction.editReply({
                    content: 'Per favore, inserisci il colore in formato hex valido.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const ping = interaction.options.getBoolean('ping');

            await channel.send({
              
                embeds: [embed],
                allowedMentions: ping ? { parse: ['everyone'] } : {},
                content: ping ? '@everyone' : null,
            });



            await interaction.editReply({ content: 'Annuncio inviato con successo!', flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(`Errore durante l'invio dell'annuncio: ${error.message}`);
            await interaction.editReply({ content: 'Errore durante l\'invio dell\'annuncio', flags: MessageFlags.Ephemeral });
        }
    },
};
