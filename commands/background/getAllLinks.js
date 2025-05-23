const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getLinksByDiscordId } = require('../../managers/backgroundsManager');
const logger = require('../../utils/loggers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recovermylinks')
        .setDescription('Recupera tutti i link dei background che hai presentato'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const discordId = interaction.user.id;
            const links = await getLinksByDiscordId(discordId);

            if (!links || links.length === 0) {
                return interaction.editReply('Non hai creato alcun link, se ne hai bisogno creane uno nel canale: <#1136373727299391659>');
            }

            const formattedLinks = links.map((row, index) => {
                const date = new Date(row.created_at).toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const formLink = `https://www.peakville.it/form/${row.link}`;
                return `${index + 1}. [Link-${index + 1}](${formLink}) - creato il ${date}`;
            }).join('\n');

            await interaction.editReply(`📄 **Ecco i tuoi link presentati:**\n\n${formattedLinks}`);
        } catch (error) {
            logger.error(`Errore nel comando /recovermylinks: ${error.message}`);
            await interaction.editReply('Si è verificato un errore durante il recupero dei tuoi link.');
        }
    },
};
