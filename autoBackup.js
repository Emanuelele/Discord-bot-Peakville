const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const logger = require('./utils/loggers.js');
require('dotenv').config();
const chalk = require('chalk');
const zipLib = require('adm-zip');

function executeBackup(channel = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(process.env.BACKUP_DIR, `backup_${timestamp}.sql`);
    const backupFormat = process.env.BACKUP_FORMAT || 'zip';

    const command = `mysqldump --user=${process.env.MYSQL_USER} --password=${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} > ${backupFile}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            logger.system(`Errore durante il backup: ${error.message}`);
            return;
        }

        logger.system(`Backup completato con successo! File salvato: \`${backupFile}\``);

        if (backupFormat === 'gz') {
            compressToGzip(backupFile);
        } else if (backupFormat === 'zip') {
            compressToZip(backupFile);
        } else {
            logger.error(`Formato di backup non supportato: ${backupFormat}`);
        }
    });
}

function compressToGzip(backupFile) {
    const gzip = zlib.createGzip();
    const source = fs.createReadStream(backupFile);
    const destination = fs.createWriteStream(`${backupFile}.gz`);

    source
        .pipe(gzip)
        .pipe(destination)
        .on('finish', () => {
            logger.system(`Backup compresso in formato GZ! File salvato: \`${backupFile}.gz\``);
            fs.unlink(backupFile, (err) => {
                if (err) logger.error(`Errore durante l'eliminazione del file non compresso: ${backupFile}`);
            });
            manageBackupFiles();
        })
        .on('error', (err) => {
            logger.error(`Errore durante la compressione in GZ: ${err.message}`);
        });
}

function compressToZip(backupFile) {
    const zipFile = `${backupFile}.zip`;

    try {
        const zipper = new zipLib();
        zipper.addLocalFile(backupFile);
        zipper.writeZip(zipFile);

        logger.system(`Backup compresso in formato ZIP! File salvato: \`${zipFile}\``);
        fs.unlink(backupFile, (err) => {
            if (err) logger.error(`Errore durante l'eliminazione del file non compresso: ${backupFile}`);
        });
        manageBackupFiles();
    } catch (err) {
        logger.error(`Errore durante la compressione in ZIP: ${err.message}`);
    }
}

function manageBackupFiles() {
    const backupDir = process.env.BACKUP_DIR;
    const maxBackups = process.env.MAX_BACKUP;

    fs.readdir(backupDir, (err, files) => {
        if (err) {
            logger.system(`Errore durante la lettura della directory di backup: ${err.message}`);
            return;
        }

        const backupFiles = files
            .filter(file => file.endsWith('.gz') || file.endsWith('.zip')) // Gestisce sia i file .gz che .zip
            .map(file => ({
                file,
                time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
            }))
            .sort((a, b) => a.time - b.time);

        if (backupFiles.length > maxBackups) {
            const filesToDelete = backupFiles.slice(0, backupFiles.length - maxBackups);
            filesToDelete.forEach(({ file }) => {
                const filePath = path.join(backupDir, file);
                fs.unlink(filePath, err => {
                    if (err) {
                        logger.error(`Errore durante la cancellazione del file: ${filePath}`);
                    } else {
                        const timestamp = new Date().toLocaleString();
                        console.log(chalk.yellow(`[${timestamp}] [BACKUP ROTATION]: Eliminato il file di backup più vecchio: ${filePath}`));
                    }
                });
            });
        }
    });
}

module.exports = {
    executeBackup
};