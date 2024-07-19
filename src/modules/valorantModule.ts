import dotenv from 'dotenv';

// ENVファイルの読み込み
dotenv.config();

// Discord Botのトークン
const TRACKER_API_KEY = process.env.TRACKER_API_KEY as string;

export { TRACKER_API_KEY };
