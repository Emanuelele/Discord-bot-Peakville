const logger = require('../utils/loggers.js');
const glob = require('glob');
const path = require('path');

async function deployInteractions(client) {

    const interactionFiles = glob.sync('./interactions/**/*.js', {
        ignore: './interactions/deploy-interactions.js',
    });

    for (const file of interactionFiles) {
        const relativePath = `.${path.sep}${path.relative(__dirname, file).replace(/\\/g, '\\')}`;
        logger.info(`Caricamento interazione: ${relativePath}`);
        const interaction = require(relativePath);
        client.interactions.set(interaction.name, interaction);
        logger.success(`Interazione caricata: ${interaction.name}`);
    }
}

module.exports = { deployInteractions };
