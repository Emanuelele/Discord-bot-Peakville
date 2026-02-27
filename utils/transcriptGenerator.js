const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// Funzione helper per scaricare file
async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = require('fs').createWriteStream(destPath);
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                file.close();
                require('fs').unlink(destPath, () => { });
                reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
            }
        }).on('error', (err) => {
            file.close();
            require('fs').unlink(destPath, () => { });
            reject(err);
        });
    });
}

// Estrae estensione dall'url, fallbacka a defaultExt
function getExtensionFromUrl(url, defaultExt = '.png') {
    try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname;
        const ext = path.extname(pathname);
        return ext || defaultExt;
    } catch {
        return defaultExt;
    }
}

// Genera il CSS base che simula Discord
function getDiscordCSS() {
    return `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=gg+sans:wght@400;500;600;700&display=swap');
        
        body {
            background-color: #313338;
            color: #dbdee1;
            font-family: 'gg sans', 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 16px;
        }

        .channel-info {
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            margin-bottom: 24px;
        }

        .channel-info h1 {
            color: #fff;
            margin: 0 0 8px 0;
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .channel-info p {
            margin: 0;
            color: #b5bac1;
        }

        .message {
            display: flex;
            padding: 2px 16px 2px 72px;
            position: relative;
            margin-top: 17px;
        }

        .message:hover {
            background-color: #2e3035;
        }

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            position: absolute;
            left: 16px;
            top: 2px;
            background-color: #5865F2;
            cursor: pointer;
            object-fit: cover;
        }

        .message-content-wrapper {
            flex: 1;
            min-width: 0;
        }

        .header {
            display: flex;
            align-items: baseline;
            gap: 8px;
            margin-bottom: 2px;
        }

        .username {
            color: #fff;
            font-weight: 500;
            font-size: 16px;
        }

        .timestamp {
            color: #949ba4;
            font-size: 12px;
        }

        .content {
            color: #dbdee1;
            line-height: 1.375rem;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .attachment {
            margin-top: 8px;
            max-width: 400px;
            border-radius: 8px;
            overflow: hidden;
            background-color: #2b2d31;
            border: 1px solid #1e1f22;
        }

        .attachment img, .attachment video {
            max-width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
        }

        .file-attachment {
            display: flex;
            align-items: center;
            padding: 10px;
            background-color: #2b2d31;
            border: 1px solid #1e1f22;
            border-radius: 4px;
            margin-top: 4px;
            width: fit-content;
            gap: 12px;
        }

        .file-attachment a {
            color: #00a8fc;
            text-decoration: none;
        }

        .file-attachment a:hover {
            text-decoration: underline;
        }
        
        .embed {
            margin-top: 8px;
            border-left: 4px solid #1e1f22;
            background-color: #2b2d31;
            border-radius: 4px;
            padding: 12px 16px;
            max-width: 520px;
        }
        
        .embed-title {
            color: #fff;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .embed-description {
            color: #dbdee1;
            font-size: 14px;
        }
    </style>
    `;
}

// Genera l'HTML e scarica gli assets
async function generateTranscript(messages, ticketId, channelName) {
    const basePath = path.join('C:', 'cdn', 'static', 'tickets', `ticket_${ticketId}`);
    const assetsPath = path.join(basePath, 'assets');
    const avatarsPath = path.join(assetsPath, 'avatars');
    const attachmentsPath = path.join(assetsPath, 'attachments');

    // Crea le directory necessarie
    await fs.mkdir(basePath, { recursive: true });
    await fs.mkdir(avatarsPath, { recursive: true });
    await fs.mkdir(attachmentsPath, { recursive: true });

    let html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transcript: ${channelName}</title>
        ${getDiscordCSS()}
    </head>
    <body>
        <div class="channel-info">
            <h1>🎫 ${channelName}</h1>
            <p>Trascrizione generata il ${new Date().toLocaleString('it-IT')}</p>
        </div>
        <div class="chat-container">
    `;

    // Ordina i messaggi dal più vecchio al più recente
    const sortedMessages = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    // Cache per gli avatar già scaricati in questo ticket
    const downloadedAvatars = new Set();

    for (const msg of sortedMessages) {
        // Scarica avatar
        let avatarUrl = msg.author.displayAvatarURL({ extension: 'png', size: 128 });
        let avatarFilename = `${msg.author.id}.png`;
        let localAvatarUrl = `https://cdn.peakville.it/static/tickets/ticket_${ticketId}/assets/avatars/${avatarFilename}`;

        if (!downloadedAvatars.has(msg.author.id) && avatarUrl) {
            try {
                // Discord restituisce webp di default se non specificato png. Forziamo png nelle API discord.js
                const avatarDest = path.join(avatarsPath, avatarFilename);
                await downloadFile(avatarUrl, avatarDest);
                downloadedAvatars.add(msg.author.id);
            } catch (err) {
                console.error(`Impossibile scaricare avatar per ${msg.author.tag}:`, err);
                localAvatarUrl = avatarUrl; // fallback all'url online se fallisce
            }
        }

        // Parsing contenuto messaggio per sostituire eventuali link a discord cdn con link locali
        // Note: I link normali inviati in chat come testo non li scarichiamo (sarebbe complesso parsare l'html), 
        // l'utente preme i link normalmente. Scarichiamo solo gli *allegati* reali caricati su Discord.
        let contentHtml = msg.content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>");

        // Renderizza attachments
        let attachmentsHtml = '';
        for (const [id, attachment] of msg.attachments) {
            const ext = getExtensionFromUrl(attachment.url, attachment.name ? path.extname(attachment.name) : '.bin');
            const safeName = attachment.name ? attachment.name.replace(/[^a-zA-Z0-9.\-_]/g, '_') : `${id}${ext}`;
            const targetFilename = `${id}_${safeName}`;
            const targetPath = path.join(attachmentsPath, targetFilename);
            const localUrl = `https://cdn.peakville.it/static/tickets/ticket_${ticketId}/assets/attachments/${targetFilename}`;

            try {
                await downloadFile(attachment.url, targetPath);

                // Genera HTML in base al tipo di file
                if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                    attachmentsHtml += `<div class="attachment"><img src="${localUrl}" alt="${safeName}"></div>`;
                } else if (attachment.contentType && attachment.contentType.startsWith('video/')) {
                    attachmentsHtml += `<div class="attachment"><video controls src="${localUrl}"></video></div>`;
                } else {
                    attachmentsHtml += `
                        <div class="file-attachment">
                            📄 <a href="${localUrl}" download="${safeName}">${safeName}</a>
                            <span style="color:#949ba4; font-size:12px;">(${(attachment.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>`;
                }
            } catch (err) {
                console.error(`Impossibile scaricare allegato ${safeName}:`, err);
                attachmentsHtml += `
                        <div class="file-attachment">
                            ❌ Errore download: <a href="${attachment.url}" target="_blank">${safeName}</a>
                        </div>`;
            }
        }

        // Renderizza Embeds generati da bot
        let embedsHtml = '';
        for (const embed of msg.embeds) {
            embedsHtml += `<div class="embed">`;
            if (embed.title) embedsHtml += `<div class="embed-title">${embed.title}</div>`;
            if (embed.description) embedsHtml += `<div class="embed-description">${embed.description.replace(/\n/g, '<br>')}</div>`;
            // Per ora non scarichiamo le immagini interne agli embed bot (come il logo), si mantengono online.
            embedsHtml += `</div>`;
        }

        html += `
        <div class="message">
            <img class="avatar" src="${localAvatarUrl}" alt="${msg.author.username}">
            <div class="message-content-wrapper">
                <div class="header">
                    <span class="username">${msg.author.username}</span>
                    <span class="timestamp">${new Date(msg.createdTimestamp).toLocaleString('it-IT')}</span>
                </div>
                <div class="content">${contentHtml}</div>
                ${attachmentsHtml}
                ${embedsHtml}
            </div>
        </div>
        `;
    }

    html += `
        </div>
    </body>
    </html>
    `;

    // Salva il file index.html
    const indexPath = path.join(basePath, 'index.html');
    await fs.writeFile(indexPath, html, 'utf8');

    // Ritorna l'URL pubblico della CDN
    return `https://cdn.peakville.it/static/tickets/ticket_${ticketId}`;
}

module.exports = {
    generateTranscript
};
