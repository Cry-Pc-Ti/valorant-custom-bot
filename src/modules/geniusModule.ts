import dotenv from 'dotenv';
import { Client as GeniusClient } from 'genius-lyrics';

// ENVファイルの読み込み
dotenv.config();

// Discord Botのトークン
const GENIUS_CLIENT_ACCESS_TOKEN = process.env.GENIUS_CLIENT_ACCESS_TOKEN as string;

const genius = new GeniusClient(GENIUS_CLIENT_ACCESS_TOKEN);

export { genius };
