import axios from 'axios';
import { AgentData_JP, AgentData_EN, AgentData } from '../types/valorantData';

const VALORANT_MAPINFO_URL = 'https://valorant-api.com/v1/maps';
const VALORANT_AGENTINFO_URL = 'https://valorant-api.com/v1/agents';

// MAP情報を取得
export const fetchMapsData = async () => {
  const res = await axios.get(VALORANT_MAPINFO_URL + '?language=ja-JP');

  return await res.data.data
    .map(
      (mapDetail: {
        tacticalDescription: string | null;
        uuid: string;
        displayName: string;
        displayIcon: string;
        splash: string;
      }) => {
        if (mapDetail.tacticalDescription !== null) {
          return {
            id: mapDetail.uuid,
            name: mapDetail.displayName,
            displayIcon: mapDetail.displayIcon,
            mapThumbnail: mapDetail.splash,
          };
        }
      }
    )
    .filter((map: { tacticalDescription: string | null; uuid: string; displayName: string }) => map);
};

// 日本語と英語のエージェント情報をそれぞれ取得
export const fetchAgentsData = async () => {
  const response_jp = await axios.get(VALORANT_AGENTINFO_URL + '?language=ja-JP');
  const response_en = await axios.get(VALORANT_AGENTINFO_URL + '?language=en-US');

  // エージェント情報を整形
  const agents_jp: AgentData_JP[] = response_jp.data.data.map(
    (agent: { uuid: string; displayName: string; role: { displayName: string }; displayIcon: string }) => {
      return {
        uuid: agent.uuid,
        name: agent.displayName,
        role: agent.role ? agent.role.displayName : '',
        iconUrl: agent.displayIcon,
      };
    }
  );

  const agents_en: AgentData_EN[] = response_en.data.data.map(
    (agent: { uuid: string; displayName: string; role: { displayName: string } }) => {
      return {
        uuid: agent.uuid,
        id: agent.displayName,
        roleId: agent.role ? agent.role.displayName : '',
      };
    }
  );

  // uuidが一致するエージェントの情報を結合
  const agents: AgentData[] = agents_jp.map((agent_jp) => {
    const agent_en = agents_en.find((agent_en) => agent_en.uuid === agent_jp.uuid);
    return {
      name: agent_jp.name,
      id: agent_en ? agent_en.id.toLowerCase() : '',
      role: agent_jp.role,
      roleId: agent_en ? agent_en.roleId.toLowerCase() : '',
      uuid: agent_jp.uuid,
      iconUrl: agent_jp.iconUrl,
    };
  });

  return agents;
};

// エージェントデータをJson形式に出力
export const outputAgentsData = async () => {
  const agents = await fetchAgentsData();
  const json = JSON.stringify(agents, null, 2);

  return json;
};
