const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { setup } = require('./setup.js');
const logger = require('./utils/loggers.js');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
    ],
    presence: {activities: [{name: "Peakville", type: ActivityType.Watching}]}
});

client.commands = new Collection();
client.interactions = new Collection();
client.joinWaitingWl = new Map();
client.inVerification = new Set();

client.once('ready', async () => {
    logger.system(`Avvio del bot in corso...`);
    logger.system(`Avvio setup...`);
    await setup(client);
    logger.system(`Bot connesso come ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
