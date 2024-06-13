import fs from 'fs';
import { AgentData, MapData } from '../../types/valorantData';
import { SpotifyPlaylistInfo } from '../../types/spotifyData';

// JSONファイルのパス
const valorantJsonFilePath = './static/data/valorantData.json';
const valorantAgentsJsonFilePath = './static/data/valorantAgentsData.json';
const spotifyJsonFilePath = './static/data/spotifyPlayListData.json';

// JSONファイルの読み込み
const valorantFileData = fs.readFileSync(valorantJsonFilePath, 'utf-8');
const valorantAgentsFileData = fs.readFileSync(valorantAgentsJsonFilePath, 'utf-8');
const spotifyFileData = fs.readFileSync(spotifyJsonFilePath, 'utf-8');

// JSONデータをオブジェクトに変換
const valorantJsonData: { agents: AgentData[]; maps: MapData[] } = JSON.parse(valorantFileData);
const valorantAgentsJsonData: AgentData[] = JSON.parse(valorantAgentsFileData);
const spotifyJsonData: { playlist: SpotifyPlaylistInfo[] } = JSON.parse(spotifyFileData);

export const valorantAgents = valorantAgentsJsonData;
export const valorantMaps = valorantJsonData.maps;
export const spotifyPlaylistId = spotifyJsonData.playlist;
