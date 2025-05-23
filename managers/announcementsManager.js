const { CronJob } = require('cron');
const { EmbedBuilder } = require('discord.js');
const db = require('../utils/database');

const activeJobs = [];

async function executeAnnouncement(client, announcement) {
    const channel = client.channels.cache.get(announcement.channel_id);
    if (!channel) return console.error(`Canale non trovato: ${announcement.channel_id}`);
    const embed = new EmbedBuilder()
        .setTitle(announcement.title)
        .setColor(announcement.color)
        .setDescription(announcement.message)
        .setThumbnail('https://cdn.peakville.it/static/general/LogoOverlay.webp')
        .setTimestamp()
        .setFooter({ text: 'Staff di Peakville', iconURL: 'https://cdn.peakville.it/static/general/logo.png' });
    await channel.send({ embeds: [embed] });
}

async function startAnnouncementJobs(client) {
    const announcements = await getActiveAnnouncements();
    announcements.forEach(announcement => {
        try {
            const cronExpression = `0 ${announcement.schedule_value} ${announcement.days_value}`;
            const job = new CronJob(cronExpression, () => {
                executeAnnouncement(client, announcement);
            });
            job.start();
            activeJobs.push(job);
        } catch (error) {
            console.error(`Errore nella creazione del job: ${error.message}`);
        }
    });
}

function stopAnnouncementJob() {
    activeJobs.forEach((job, index) => {
        try {
            job.stop();
            activeJobs.splice(index, 1);
        } catch (error) {
            console.error(`Errore nell'arresto del job: ${error.message}`);
        }
    });
}

function reactiveAnnouncementJob(client, announcement){
    try {
        const cronExpression = `0 ${announcement.schedule_value} ${announcement.days_value}`;
        const job = new CronJob(cronExpression, () => {
            executeAnnouncement(client, announcement);
        });
        job.start();
        activeJobs.push(job);
    } catch (error) {
        console.error(`Errore nella creazione del job: ${error.message}`);
    }
}


async function createAnnouncement(channel_id, title, message, schedule_value, days_value, color) {
    const query = `
        INSERT INTO announcements (channel_id, title, message, schedule_value, days_value, color)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [channel_id, title, message, schedule_value, days_value, color]);
    return result;
   
}


async function getActiveAnnouncements() {
    const query = `SELECT * FROM announcements WHERE active = TRUE`;
    const [rows] = await db.execute(query);
    return rows;
}

async function getAllAnnouncements() {
    const query = `SELECT * FROM announcements`;
    const [rows] = await db.execute(query);
    return rows;
}

async function getPausedAnnouncements() {
    const query = `SELECT * FROM announcements WHERE active = FALSE`;
    const [rows] = await db.execute(query);
    return rows;
}


async function deleteAnnouncement(id) {
    const query = `DELETE FROM announcements WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
}

async function pauseAnnouncement(id) {
    const query = `UPDATE announcements SET active = FALSE WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result;
}

async function reactivateAnnouncement(id) {
    const query = `UPDATE announcements SET active = TRUE WHERE id = ?`;
    const query2 = `SELECT * FROM announcements WHERE id = ?`;
    await db.execute(query, [id]);
    const [result] = await db.execute(query2, [id]);
    return result;
}

module.exports = { startAnnouncementJobs,
    executeAnnouncement, 
    stopAnnouncementJob, 
    reactiveAnnouncementJob, 
    createAnnouncement,
    getActiveAnnouncements,
    deleteAnnouncement,
    pauseAnnouncement,
    reactivateAnnouncement,
    getPausedAnnouncements,
    getAllAnnouncements
}
