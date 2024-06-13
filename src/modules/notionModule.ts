import * as dotenv from 'dotenv';
import { Client } from '@notionhq/client';

// ENVファイルの読み込み
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_CLIENT_SECRET });
const adminDbId = process.env.ADMIN_DB_ID as string;
const spotifyDbId = process.env.SPOTIFY_DB_ID as string;
const banDbId = process.env.BAN_DB_ID as string;

export { notion, adminDbId, spotifyDbId, banDbId };
