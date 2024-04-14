import fs from 'fs';
import { AgentData, MapData } from '../../types/valorantData';

// JSONファイルのパス
const jsonFilePath = './static/data/valorantData.json';

// JSONファイルの読み込み
const fileData = fs.readFileSync(jsonFilePath, 'utf-8');

// JSONデータをオブジェクトに変換
const jsonData: { agents: AgentData[]; maps: MapData[] } = JSON.parse(fileData);

export const valorantAgents = jsonData.agents;
export const valorantMaps = jsonData.maps;
