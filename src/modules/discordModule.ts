import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

// ENVファイルの読み込み
dotenv.config();

// Discord Botのトークン
const TOKEN = process.env.DISCORD_TOKEN as string;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;

<<<<<<< HEAD
const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  closeTimeout: 60000,
});
=======
const discord = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
>>>>>>> origin/master

export { discord, TOKEN, CLIENT_ID };
