const { createLog } = require('../../managers/fivemManager.js');
const logger = require('../../utils/loggers.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        try {
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

            const fetchedLogs = await newMember.guild.fetchAuditLogs({
                limit: 1,
                type: 25,
            });

            const log = fetchedLogs.entries.first();
            const executor = log ? log.executor : null;

            if (addedRoles.size > 0) {
                let addedRolesMetadata = {
                    "executor": executor ? executor.id : "unknown",
                    "target": newMember.id,
                    "roles": addedRoles.map(role => role.name).join(", "),
                };
                await createLog("ROLE_ADD_DISCORD", addedRolesMetadata);
            }

            if (removedRoles.size > 0) {
                let removedRolesMetadata = {
                    "executor": executor ? executor.id : "unknown",
                    "target": newMember.id,
                    "roles": removedRoles.map(role => role.name).join(", "),
                };
                await createLog("ROLE_REMOVE_DISCORD", removedRolesMetadata);
            }
        } catch(error) {
            logger.error("Errore nella creazione del log: relosLog.js");
        }
    },
};
