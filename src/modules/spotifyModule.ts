import dotenv from 'dotenv';

// ENVファイルの読み込み
dotenv.config();

// Discord Botのトークン
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;

export { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET };
