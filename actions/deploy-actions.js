const logger = require('../utils/loggers.js');
const glob = require('glob');
const path = require('path');

async function deployActions(client) {

    const actionFiles = glob.sync('./actions/**/*.js', {
        ignore: './actions/deploy-actions.js',
    });

    for (const file of actionFiles) {
        const relativePath = `.${path.sep}${path.relative(__dirname, file).replace(/\\/g, '\\')}`;
        logger.info(`Caricamento action: ${relativePath}`);
        const action = require(relativePath);
        logger.success(`Action caricata: ${action.customId}`);
        try {
            logger.info(`Esecuzione della startup action: ${action.customId}`);
            await action.execute(client);
            logger.success(`Startup action ${action.customId} eseguita con successo.`);
        } catch (error) {
            logger.error(`Errore durante l'esecuzione della startup action ${action.customId}: ${error}`);
        }
    }
}

module.exports = { deployActions };
