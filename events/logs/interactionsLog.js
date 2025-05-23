const logger = require('../../utils/loggers.js');
const { createLog } = require('../../managers/fivemManager.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            let metadata = null;
            if (interaction.isCommand()) {
                metadata = {
                    "executor": interaction.user.id,
                    "command_name": interaction.commandName,
                };

                const subcommand = interaction.options.getSubcommand(false);
                if (subcommand) {
                    metadata["subcommand_name"] = subcommand;

                    const subcommandOptions = interaction.options.data.find(opt => opt.name === subcommand)?.options || [];
                    subcommandOptions.forEach(option => {
                        metadata[option.name] = option.value;
                    });
                } else {
                    interaction.options.data.forEach(option => {
                        metadata[option.name] = option.value;
                    });
                }

                await createLog("COMMAND_EXEC_DISCORD", metadata);
                return;
            }
            if (interaction.isButton()) {
                metadata = {
                    "executor": interaction.user.id,
                    "button_name": interaction.customId,
                }
                await createLog("BUTTON_CLICK_DISCORD", metadata);
                return;
            }
            if (interaction.isModalSubmit()) {
                metadata = {
                    "executor": interaction.user.id,
                    "modal_id": interaction.customId,
                };

                interaction.fields.fields.forEach(field => {
                    metadata[field.customId] = field.value;
                });

                await createLog("MODAL_SUBMIT_DISCORD", metadata);
                return;
            }

            if (interaction.isStringSelectMenu()) {
                metadata = {
                    "executor": interaction.user.id,
                    "select_menu_id": interaction.customId,
                };

                metadata["selected_values"] = interaction.values;

                await createLog("SELECT_MENU_INTERACTION_DISCORD", metadata);
                return;
            }
        } catch(error) {
            logger.error(`Errore nella creazione del log: interactionsLog.js`);
        }
    },
};
