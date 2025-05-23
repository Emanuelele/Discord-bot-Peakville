const { REST, Routes } = require('discord.js');
const path = require('path');
const logger = require('../utils/loggers.js');
const glob = require('glob');
require('dotenv').config();

async function deployCommands(client) {
    const commands = [];
    const commandFiles = glob.sync('./commands/**/*.js', {
        ignore: './commands/deploy-commands.js',
    });

    for (const file of commandFiles) {
        const relativePath = `.${path.sep}${path.relative(__dirname, file).replace(/\\/g, '\\')}`;
        logger.info(`Caricamento comando: ${relativePath}`);
        const command = require(relativePath);
        const data = command.data.toJSON();
        client.commands.set(data.name, command);
        commands.push(data);
        logger.success(`Comando caricato: ${command.data.name}`);
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    let commandis = null;

    try {
        logger.info('Registrazione dei comandi...');
        commandis = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), 
            { body: commands }
        );
        logger.success(`Comandi registrati con successo: ${commandis.map(cmd => cmd.name)}`);
    } catch (error) {
        logger.error(`Errore durante la registrazione dei comandi: ${error}`);
    }
}

module.exports = { deployCommands };
