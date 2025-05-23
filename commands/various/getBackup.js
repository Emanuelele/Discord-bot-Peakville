const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('backup-get')
        .setDescription('Ottieni l\'ultimo backup del database.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral })
            const backupDirectory = path.join(__dirname, '../../backups');
            const latestBackupFile = await getLatestBackup(backupDirectory);
            if (!fs.existsSync(latestBackupFile)) {
                await interaction.editReply({ content: `Il file non esiste! (${latestBackupFile})`, flags: MessageFlags.Ephemeral });
                return;
            }

            const file = new AttachmentBuilder(latestBackupFile);
            await interaction.user.send({
                content: 'Ecco il file richiesto:',
                files: [file],
            });

            await interaction.editReply({ content: 'Il file è stato inviato in privato!', flags: MessageFlags.Ephemeral });
        } catch (error) {
            await interaction.editReply({ content: `Si è verificato un errore durante l\'invio del file: ${error}`, flags: MessageFlags.Ephemeral });
        }
    },
};

async function getLatestBackup(directoryPath) {
    const backupFormat = process.env.BACKUP_FORMAT || 'zip';
    try {
        const files = fs.readdirSync(directoryPath);

        const backupFiles = files.filter(file => file.startsWith('backup_') && file.endsWith(backupFormat));

        if (backupFiles.length === 0) {
            return null;
        }

        const latestBackup = backupFiles.reduce((latest, current) => {
            const latestTimestamp = new Date(latest.match(new RegExp(`backup_(.*)\\${backupFormat}`))[1]);
            const currentTimestamp = new Date(current.match(new RegExp(`backup_(.*)\\${backupFormat}`))[1]);

            return currentTimestamp > latestTimestamp ? current : latest;
        });

        return path.join(directoryPath, latestBackup);
    } catch (error) {
        return null;
    }
}
