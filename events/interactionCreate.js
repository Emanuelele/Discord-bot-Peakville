const logger = require('../utils/loggers.js');
const { MessageFlags } = require('discord.js');
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (interaction.isCommand()) {
                const handler = client.commands.get(interaction.commandName);
                if (handler) await handler.execute(interaction, client);
                return;
            }
            if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
                const handler = client.interactions.get(interaction.customId);
                if (handler) await handler.execute(interaction, client);
                return;
            }
        } catch (error) {
            logger.error(`Errore durante la gestione dell\'interazione in ${interaction.customId}: ${error}`);
            if (interaction.replied || interaction.deferred) {
                try {
                    await interaction.followUp({ content: `Errore durante la gestione dell'interazione.`, flags: MessageFlags.Ephemeral });
                } catch (error) {
                    logger.error(`Errore durante la gestione dell\'interazione in ${interaction.customId}: ${error}`);  
                }
            } else {
                try {
                    await interaction.reply({ content: `Errore durante la gestione dell'interazione.`, flags: MessageFlags.Ephemeral });
                } catch (error) {
                    logger.error(`Errore durante la gestione dell\'interazione in ${interaction.customId}: ${error}`);  
                }
            }
        }
    },
};
