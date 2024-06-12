import axios from 'axios';
import { APIMapDetail, AbilitiesData, MapData, RoleData } from '../types/valorantData';

const VALORANT_MAPINFO_URL = 'https://valorant-api.com/v1/maps';
const VALORANT_AGENTINFO_URL = 'https://valorant-api.com/v1/agents';

// MAP情報を取得
export const getMapInfo = async (): Promise<MapData[]> => {
  const res = await axios.get(VALORANT_MAPINFO_URL + '?language=ja-JP');

  return res.data.data
    .filter((mapDetail: APIMapDetail) => mapDetail.tacticalDescription !== null)
    .map((mapDetail: APIMapDetail) => ({
      id: mapDetail.uuid,
      name: mapDetail.displayName,
      displayIcon: mapDetail.displayIcon,
      mapThumbnail: mapDetail.splash,
    }));
};

// エージェント情報を取得
// TODO:interfaceを整える。
export const getAgentsInfo = async () => {
  const res = await axios.get(VALORANT_AGENTINFO_URL + '?language=ja-JP');

  const agentsInfo = res.data.data.map(
    (agent: { uuid: string; displayName: string; abilities: AbilitiesData[]; role: RoleData }) => {
      return {
        id: agent.uuid,
        name: agent.displayName,
        role: agent.role,
        abilities: agent.abilities,
      };
    }
  );
  return agentsInfo;
};
