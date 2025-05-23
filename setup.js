const { deployCommands } = require('./commands/deploy-commands');
const { deployEvents } = require('./events/deploy-events');
const { deployInteractions } = require('./interactions/deploy-interactions');
const { deployActions } = require('./actions/deploy-actions');
const { startAnnouncementJobs } = require('./managers/announcementsManager');
const { executeBackup } = require('./autoBackup.js')
const logger = require('./utils/loggers.js');

async function setup(client) {
    await deployCommands(client);
    await deployEvents(client);
    await deployInteractions(client);
    await deployActions(client);
    await startAnnouncementJobs(client);
    await executeBackup()
    setInterval(() => {
        executeBackup();
    }, 3600000);
    logger.success(`Setup completato con successo!`)
}

module.exports = { setup };