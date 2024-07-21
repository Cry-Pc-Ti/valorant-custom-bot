import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

// ENVファイルの読み込み
dotenv.config();

// Discord Botのトークン
const TOKEN = process.env.DISCORD_TOKEN as string;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;
const OFFICIAL_DCIORD_ID = process.env.OFFICIAL_DCIORD_ID as string;

const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  closeTimeout: 60000,
});

export { discord, TOKEN, CLIENT_ID, OFFICIAL_DCIORD_ID };
