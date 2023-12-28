import {
  Client,
  GatewayIntentBits,
  Interaction,
  ChatInputCommandInteraction,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from 'discord.js';
import dotenv from 'dotenv';

// ENVファイルの読み込み
dotenv.config();

// Discord Botのトークン
const token: string = process.env.DISCORD_TOKEN!;
const clientId: string = process.env.DISCORD_CLIENT_ID!;
const guildId: string = process.env.DISCORD_GUILD_ID!;

const discord = new Client({ intents: GatewayIntentBits.Guilds });

export {
  discord,
  token,
  clientId,
  guildId,
  REST,
  Routes,
  Interaction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
};
