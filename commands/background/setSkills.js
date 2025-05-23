const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const logger = require('../../utils/loggers.js');

// Elenco delle skill/abilità
const SKILLS = [
  {
    id: "agility",
    label: "Agilità",
    abilities: [
      { id: "training", label: "Allenamento" },
      { id: "reflexes", label: "Riflessi" }
    ]
  },
  {
    id: "ballistics",
    label: "Balistica",
    abilities: [
      { id: "practice", label: "Pratica" },
      { id: "experience", label: "Esperienza" }
    ]
  },
  {
    id: "technology",
    label: "Tecnologia",
    abilities: [
      { id: "practice", label: "Pratica" },
      { id: "informatics", label: "Informatica" }
    ]
  },
  {
    id: "strength",
    label: "Forza",
    abilities: [
      { id: "constitution", label: "Costituzione" },
      { id: "fighting", label: "Combattimento" }
    ]
  },
  {
    id: "intuition",
    label: "Intuito",
    abilities: [
      { id: "perception", label: "Percezione" },
      { id: "empathy", label: "Empatia" }
    ]
  },
  {
    id: "stealth",
    label: "Furtività",
    abilities: [
      { id: "practice", label: "Pratica" },
      { id: "knowledge", label: "Conoscenza" }
    ]
  },
  {
    id: "narcosynthesis",
    label: "Narcosintesi",
    abilities: [
      { id: "consumption", label: "Consumo" },
      { id: "production", label: "Produzione" }
    ]
  },
  {
    id: "drive",
    label: "Guida",
    abilities: [
      { id: "practice", label: "Pratica" },
      { id: "experience", label: "Esperienza" }
    ]
  },
  {
    id: "manual_skill",
    label: "Manualità",
    abilities: [
      { id: "practice", label: "Pratica" },
      { id: "mechanic", label: "Meccanica" }
    ]
  },
  {
    id: "chemistry",
    label: "Chimica",
    abilities: [
      { id: "medicine", label: "Medicina" },
      { id: "knowledge", label: "Conoscenza" }
    ]
  },
];

// Funzione per creare un modal per 5 skill (10 abilità)
// step:
//  0 -> modal per le prime 5 skill (skill[0] ... skill[4])
//  1 -> modal per le ultime 5 skill (skill[5] ... skill[9])
function createSkillsModal(step) {
  const modal = new ModalBuilder()
    .setCustomId(`setSkillsModal_${step}`)
    .setTitle(`Assegna punti alle Skill (${step === 0 ? '1/2' : '2/2'})`);

  const start = step * 5;
  const end = (step + 1) * 5;
  for (let i = start; i < end; i++) {
    const skill = SKILLS[i];
    for (let j = 0; j < 2; j++) {
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(`skill_${i}_${j}`)
            .setLabel(`${skill.label}: ${skill.abilities[j].label} (0-2)`)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(1)
            .setPlaceholder('0')
        )
      );
    }
  }
  return modal;
}

// Memorizza temporaneamente i punti tra i 2 step (puoi sostituire con DB se vuoi)
const tempSkillAssignments = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-skills')
    .setDescription('Imposta le skill per l\'utente all\'ingresso del server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Utente')
        .setRequired(true)),

  async execute(interaction, client) {
    try {
      // NON utilizziamo deferReply poiché l'uso di showModal deve essere effettuato
      // prima di inviare qualsiasi risposta all'interazione.
      
      // Step 1: Mostra il primo modal per le prime 5 skill
      const modalStep0 = createSkillsModal(0);
      await interaction.showModal(modalStep0);

      // Attendi la submission del modal per lo step 0
      const filterStep0 = i => i.customId === 'setSkillsModal_0' && i.user.id === interaction.user.id;
      const modalInteraction0 = await interaction.awaitModalSubmit({ filter: filterStep0, time: 60000 }).catch(() => null);
      if (!modalInteraction0) {
        return await interaction.followUp({ content: 'Tempo scaduto per il modulo delle prime 5 skill.', ephemeral: true });
      }

      // Salva le risposte del primo modal
      for (let i = 0; i < 5; i++) {
        tempSkillAssignments[i] = { abilities: [] };
        for (let j = 0; j < 2; j++) {
          const value = modalInteraction0.fields.getTextInputValue(`skill_${i}_${j}`);
          const points = parseInt(value) || 0;
          tempSkillAssignments[i].abilities[j] = Math.min(points, 2);
        }
      }

      // Invia un follow-up informativo per il primo modal
      await modalInteraction0.followUp({ content: 'Modulo 1 ricevuto! Ora compila il secondo modulo.', ephemeral: true });

      // Step 2: Mostra il secondo modal per le ultime 5 skill
      const modalStep1 = createSkillsModal(1);
      await interaction.followUp({ content: "Compila il secondo modulo per assegnare i punti alle restanti 5 skill.", ephemeral: true });
      await interaction.showModal(modalStep1);

      // Attendi la submission del modal per lo step 1
      const filterStep1 = i => i.customId === 'setSkillsModal_1' && i.user.id === interaction.user.id;
      const modalInteraction1 = await interaction.awaitModalSubmit({ filter: filterStep1, time: 60000 }).catch(() => null);
      if (!modalInteraction1) {
        return await interaction.followUp({ content: 'Tempo scaduto per il modulo delle ultime 5 skill.', ephemeral: true });
      }

      // Salva le risposte del secondo modal
      for (let i = 5; i < 10; i++) {
        tempSkillAssignments[i] = { abilities: [] };
        for (let j = 0; j < 2; j++) {
          const value = modalInteraction1.fields.getTextInputValue(`skill_${i}_${j}`);
          const points = parseInt(value) || 0;
          tempSkillAssignments[i].abilities[j] = Math.min(points, 2);
        }
      }

      // Invia un follow-up informativo per il secondo modal
      await modalInteraction1.followUp({ content: 'Modulo 2 ricevuto!', ephemeral: true });

      // Calcola il totale dei punti assegnati
      let totalPoints = 0;
      for (let i = 0; i < SKILLS.length; i++) {
        totalPoints += tempSkillAssignments[i].abilities.reduce((a, b) => a + b, 0);
      }

      if (totalPoints > 12) {
        return await interaction.followUp({ content: `Hai assegnato ${totalPoints} punti, che supera il massimo consentito di 12. Riprova assegnando i punti correttamente.`, ephemeral: true });
      }

      // Crea un messaggio riepilogativo
      let summary = `Hai assegnato un totale di ${totalPoints} punti alle seguenti skill:\n`;
      for (let i = 0; i < SKILLS.length; i++) {
        const skill = SKILLS[i];
        const pointsAbility1 = tempSkillAssignments[i].abilities[0];
        const pointsAbility2 = tempSkillAssignments[i].abilities[1];
        summary += `**${skill.label}**: ${skill.abilities[0].label}: ${pointsAbility1}, ${skill.abilities[1].label}: ${pointsAbility2}\n`;
      }

      // Invia il messaggio riepilogativo all'utente
      await interaction.followUp({ content: summary, ephemeral: true });
    } catch (error) {
      logger.error(error);
      await interaction.followUp({ content: 'C\'è stato un errore durante l\'assegnazione delle skill.', ephemeral: true });
    }
  },
  SKILLS,
  tempSkillAssignments
};