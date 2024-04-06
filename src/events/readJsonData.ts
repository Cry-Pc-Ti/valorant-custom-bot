import fs from 'fs';
import { AgentData, MapData } from '../types/valorantData';

// JSONファイルのパス
<<<<<<< HEAD
const jsonFilePath = './static/data/valorantData.json';
=======
const jsonFilePath = '../data/valorantData.json';
>>>>>>> parent of 864d899 (fix)

// JSONファイルの読み込み
const fileData = fs.readFileSync(jsonFilePath, 'utf-8');

// JSONデータをオブジェクトに変換
const jsonData: { agents: AgentData[]; maps: MapData[] } = JSON.parse(fileData);

export const valorantAgents = jsonData.agents;
export const valorantMaps = jsonData.maps;
