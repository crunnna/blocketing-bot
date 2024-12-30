import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Export the environment variables for use in other parts of the application
export const TOKEN = process.env.DISCORD_TOKEN; // Discord bot token
export const CLIENT_ID = process.env.DISCORD_CLIENT_ID; // Discord client ID
export const GUILD_ID = process.env.DISCORD_GUILD_ID; // Discord guild (server) ID
export const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID; // Discord channel ID
export const MINECRAFT_SERVER_URL = process.env.MINECRAFT_SERVER_URL; // Minecraft server URL
export const PORT = process.env.PORT; // Port number for the Express server
export const OP_ROLE_ID = process.env.OP_ROLE_ID; // Role ID for users with operator permissions