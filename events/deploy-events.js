const logger = require('../utils/loggers.js');
const glob = require('glob');
const path = require('path');

async function deployEvents(client) {

    const eventFiles = glob.sync('./events/**/*.js', {
        ignore: './events/deploy-events.js',
    });

    for (const file of eventFiles) {
        const relativePath = `.${path.sep}${path.relative(__dirname, file).replace(/\\/g, '\\')}`;
        logger.info(`Caricamento evento: ${relativePath}`);
        const event = require(relativePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
            logger.success(`Evento caricato: ${event.name}`);
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
            logger.success(`Evento caricato: ${event.name}`);
        }
    }
}

module.exports = { deployEvents };
