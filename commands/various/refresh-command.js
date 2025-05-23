const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const path = require('path');
const glob = require('glob');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh-command')
        .setDescription('Refresha un comando.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Il comando da refreshare.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const commandsPath = path.resolve(__dirname, '../');
        const commandFiles = glob.sync(`${commandsPath}/**/*.js`, {
            ignore: `${commandsPath}/deploy-commands.js`,
        });

        let commandFile;
        for (const filePath of commandFiles) {
            const relativePath = `.${path.sep}${path.relative(__dirname, filePath).replace(/\\/g, '\\')}`;
            const command = require(relativePath);
            if (command.data && command.data.name === commandName) {
                commandFile = relativePath;
                console.log(relativePath);
                break;
            }
        }

        if (!commandFile) {
            return interaction.editReply(`Non ci sono comandi con il nome: \`${commandName}\`!`);
        }

        try {
            delete require.cache[require.resolve(commandFile)];
            const newCommand = require(commandFile);
            client.commands.set(newCommand.data.name, newCommand);

            await interaction.editReply(`Il comando \`${newCommand.data.name}\` è stato ricaricato con successo!`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`C'è stato un errore nel ricaricare il comando \`${commandName}\`:\n\`${error.message}\``);
        }
    },
};
