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

    // Send the message to the Minecraft server
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

// Endpoint to receive join/leave messages from Minecraft
app.post('/minecraft-join-leave', async (req, res) => {
    const { username, action } = req.body;

    if (!username || !action) {
        return res.status(400).send('Invalid request');
    }

    const message = `**${username}** has ${action} the server.`;

    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        if (channel.isText()) {
            await channel.send(message);
        }
        res.status(200).send('Message sent to Discord');
    } catch (error) {
        console.error('Error sending message to Discord:', error);
        res.status(500).send('Failed to send message to Discord');
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});