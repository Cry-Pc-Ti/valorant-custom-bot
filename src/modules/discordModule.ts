import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

// ENVファイルの読み込み
dotenv.config();

// Discord Botのトークン
const token = process.env.DISCORD_TOKEN as string;
const clientId = process.env.DISCORD_CLIENT_ID as string;
const guildId = process.env.DISCORD_GUILD_ID as string;
const mainVoiceChannelId = process.env.DISCORD_MAIN_VOICE_CHANNEL_ID as string;
const subVoiceChannelId = process.env.DISCORD_SUB_VOICE_CHANNEL_ID as string;

const discord = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

export { discord, token, clientId, guildId, mainVoiceChannelId, subVoiceChannelId };
