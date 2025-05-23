const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();

const logDir = path.join(__dirname, '../logs');
const MAX_LOG_FILES = parseInt(process.env.MAX_LOG_FILES, 10) || 10;
const logFileName = `bot-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
const logFilePath = path.join(logDir, logFileName);

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

function rotateLogs() {
    const files = fs.readdirSync(logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
            name: file,
            time: fs.statSync(path.join(logDir, file)).mtime.getTime()
        }))
        .sort((a, b) => a.time - b.time);

    while (files.length >= MAX_LOG_FILES) {
        const oldestFile = files.shift();
        fs.unlinkSync(path.join(logDir, oldestFile.name));
        const timestamp = new Date().toLocaleString();
        console.log(chalk.yellow(`[${timestamp}] [LOG ROTATION]: Eliminato il file di log più vecchio: ${oldestFile.name}`));
    }
}

rotateLogs();

function log(level, message, colorFn) {
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    const coloredMessage = colorFn ? colorFn(logMessage) : logMessage;
    fs.appendFileSync(logFilePath, logMessage + '\n');
    console.log(coloredMessage);
}

module.exports = {
    info: (message) => log('info', message, chalk.blue),
    success: (message) => log('ok', message, chalk.green),
    warn: (message) => log('warn', message, chalk.yellow),
    error: (message) => log('error', message, chalk.red),
    system: (message) => log('system', message, chalk.magenta),
    debug: (message) => log('debug', message, chalk.gray),
};
