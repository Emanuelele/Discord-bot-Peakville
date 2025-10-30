const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const db = require('../../utils/database.js');
const logger = require('../../utils/loggers.js');
const axios = require('axios');
const { wipeAllBackgroundsForUser } = require('../../managers/backgroundsManager.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wipe')
        .setDescription('Wipa un player sul server Fivem.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Tagga l\'utente')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('completo')
                .setDescription('Se selezionato, esegue un wipe completo')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('user');
        const isFullWipe = interaction.options.getBoolean('completo') || false;

        try {
            // Prima ottieni la lista dei personaggi dal server FiveM
            const charactersResponse = await axios.post('http://localhost:30120/peakville_discordinterface/fdiscord/getCharacters', {
                discordId: user.id,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });

            const characters = charactersResponse.data.characters;

            if (!characters || characters.length === 0) {
                await interaction.editReply("Nessun personaggio trovato per questo utente.");
                return;
            }

            // Se c'è un solo personaggio, procedi direttamente
            if (characters.length === 1) {
                await performWipe(interaction, user, characters[0].identifier, isFullWipe);
                return;
            }

            // Se ci sono più personaggi, mostra il menu di selezione
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('character_select')
                .setPlaceholder('Seleziona il personaggio da wipare')
                .addOptions(
                    characters.map((char, index) => ({
                        label: `${char.firstname} ${char.lastname}`,
                        description: `Personaggio ${index + 1} - Job: ${char.job || 'N/A'}`,
                        value: char.identifier,
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.editReply({
                content: `Trovati ${characters.length} personaggi per ${user}. Seleziona quale wipare:`,
                components: [row],
            });

            // Attendi la selezione dell'utente
            const collectorFilter = i => i.customId === 'character_select' && i.user.id === interaction.user.id;
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: collectorFilter,
                time: 60000,
            });

            collector.on('collect', async (selectInteraction) => {
                const selectedCharacterId = selectInteraction.values[0];
                const selectedCharacter = characters.find(char => char.identifier === selectedCharacterId);
                
                await selectInteraction.update({
                    content: `Wipando il personaggio ${selectedCharacter.firstname} ${selectedCharacter.lastname}...`,
                    components: [],
                });

                await performWipe(interaction, user, selectedCharacterId, isFullWipe, selectInteraction);
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({
                        content: 'Tempo scaduto. Comando annullato.',
                        components: [],
                    });
                }
            });

        } catch (error) {
            logger.error(error);
            await interaction.editReply("Errore durante il recupero dei personaggi. Prova di nuovo più tardi.");
        }
    },
};

async function performWipe(interaction, user, characterId, isFullWipe, selectInteraction = null) {
    try {
        const response = await axios.post('http://localhost:30120/peakville_discordinterface/fdiscord/wipe', {
            discordId: user.id,
            characterId: characterId,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000,
        });

        if (isFullWipe) {
            await wipeAllBackgroundsForUser(user.id);
            const member = await interaction.guild.members.fetch(user.id);
            await member.roles.add(process.env.WIPE_ROLE);
        }

        const finalMessage = `Personaggio di ${user} wipato con successo: ${response.data.message}`;
        
        if (selectInteraction) {
            await selectInteraction.editReply({
                content: finalMessage,
                components: [],
            });
        } else {
            await interaction.editReply(finalMessage);
        }

    } catch (error) {
        logger.error(error);
        const errorMessage = "Errore durante il wipe del personaggio. Prova di nuovo più tardi.";
        
        if (selectInteraction) {
            await selectInteraction.editReply({
                content: errorMessage,
                components: [],
            });
        } else {
            await interaction.editReply(errorMessage);
        }
    }
}