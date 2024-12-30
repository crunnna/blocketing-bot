import pkg from 'discord.js';
import { TOKEN, CLIENT_ID, GUILD_ID, OP_ROLE_ID, MINECRAFT_SERVER_URL } from './config.js';

const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = pkg;

// Initialize the Discord client with necessary intents
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Required to fetch channels by ID
        GatewayIntentBits.GuildMessages, // Required to send messages to channels
        GatewayIntentBits.MessageContent, // Required to access message content
    ],
});

// Event listener for when the client is ready
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    const commands = [
        {
            name: 'command',
            description: 'Execute a Minecraft command',
            options: [
                {
                    name: 'command',
                    type: 3, // STRING type
                    description: 'The command to execute',
                    required: true,
                },
            ],
        },
    ];

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

// Event listener for interactions (commands)
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'command') {
        if (!interaction.member.roles.cache.has(OP_ROLE_ID)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const command = options.getString('command');
        const username = interaction.user.username; // Get the Discord username
        const avatarURL = interaction.user.displayAvatarURL(); // Get the Discord user's avatar URL

        const payload = {
            command,
            username, // Include the username in the payload
        };

        try {
            const response = await fetch(`${MINECRAFT_SERVER_URL}/execute-command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const embed = new EmbedBuilder()
                    .setColor('#e20600') // Set the color to #e20600
                    .setTitle('Command Executed')
                    .setDescription(`**Command:** ${command}\n**Executed by:** ${username}`)
                    .setThumbnail(avatarURL) // Add the user's avatar as a thumbnail
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                const errorText = await response.text();
                await interaction.reply(`Failed to execute command: ${errorText}`);
            }
        } catch (error) {
            console.error('Error sending command to Minecraft:', error);
            await interaction.reply('Failed to send command to Minecraft.');
        }
    }
});

// Log in to Discord with the bot token
client.login(TOKEN);