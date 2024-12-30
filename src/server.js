import express from 'express';
import { client } from './discordClient.js';
import { CHANNEL_ID, MINECRAFT_SERVER_URL, PORT } from './config.js';

const app = express(); 
app.use(express.json());

// This event listener sends messages from Discord --> Minecraft
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages
    if (message.channel.id !== CHANNEL_ID) return; // Ignore messages from other channels

    // Check if the message contains attachments or embeds
    if (message.attachments.size > 0 || message.embeds.length > 0) {
        console.log('Message contains attachments or embeds, ignoring.');
        return;
    }

    // Handle normal messages
    const payload = {
        username: message.author.username,
        content: message.content,
    };

    try {
        const response = await fetch(`${MINECRAFT_SERVER_URL}/discord-to-minecraft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Failed to send message to Minecraft:', await response.text());
        }
    } catch (error) {
        console.error('Error sending message to Minecraft:', error);
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});