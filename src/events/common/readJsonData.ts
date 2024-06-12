import fs from 'fs';
import { AgentData, MapData } from '../../types/valorantData';

// JSONファイルのパス
const valorantJsonFilePath = './static/data/valorantData.json';

// JSONファイルの読み込み
const valorantFileData = fs.readFileSync(valorantJsonFilePath, 'utf-8');

// JSONデータをオブジェクトに変換
const valorantJsonData: { agents: AgentData[]; maps: MapData[] } = JSON.parse(valorantFileData);

export const valorantAgents = valorantJsonData.agents;
export const valorantMaps = valorantJsonData.maps;
