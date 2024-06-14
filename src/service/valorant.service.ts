import axios from 'axios';
import { AgentData_JP, AgentData_EN, AgentData, MapData } from '../types/valorantData';
import { Logger } from '../events/common/log';

const VALORANT_AGENTINFO_URL = 'https://valorant-api.com/v1/agents';
const VALORANT_MAPINFO_URL = 'https://valorant-api.com/v1/maps';

// Valorant-APIからエージェント情報を取得
export const fetchAgentsData = async () => {
  try {
    // 日本語と英語のエージェント情報をそれぞれ取得
    const response_jp = await axios.get(VALORANT_AGENTINFO_URL + '?language=ja-JP');
    const response_en = await axios.get(VALORANT_AGENTINFO_URL + '?language=en-US');

    // エージェント情報を整形
    const agents_jp: AgentData_JP[] = response_jp.data.data
      .map((agent: { uuid: string; displayName: string; role: { displayName: string }; displayIcon: string }) => {
        // 空のエージェント情報を除外
        if (!agent.displayName || !agent.role || !agent.role.displayName) {
          return null;
        }
        return {
          uuid: agent.uuid,
          name: agent.displayName,
          role: agent.role.displayName,
          iconUrl: agent.displayIcon,
        };
      })
      .filter((agent: AgentData_JP): agent is AgentData_JP => agent !== null); // null を除外

    const agents_en: AgentData_EN[] = response_en.data.data
      .map((agent: { uuid: string; displayName: string; role: { displayName: string } }) => {
        // 空のエージェント情報を除外
        if (!agent.displayName || !agent.role || !agent.role.displayName) {
          return null;
        }
        return {
          uuid: agent.uuid,
          id: agent.displayName.toLowerCase(),
          roleId: agent.role.displayName.toLowerCase(),
        };
      })
      .filter((agent: AgentData_EN): agent is AgentData_EN => agent !== null); // null を除外

    // uuidが一致するエージェントの情報を結合
    const agents: AgentData[] = agents_jp
      .map((agent_jp) => {
        const agent_en = agents_en.find((agent_en) => agent_en.uuid === agent_jp.uuid);
        if (agent_en) {
          return {
            name: agent_jp.name,
            id: agent_en.id,
            role: agent_jp.role,
            roleId: agent_en.roleId,
            uuid: agent_jp.uuid,
            iconUrl: agent_jp.iconUrl,
          };
        }
        return null;
      })
      .filter((agent): agent is AgentData => agent !== null); // null を除外

    // エージェント名で昇順に並び替え
    agents.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    // エージェントのロール順に並び替え
    const roleOrder = ['duelist', 'initiator', 'controller', 'sentinel'];
    const sortedAgents: AgentData[] = [];
    roleOrder.forEach((role) => {
      agents.forEach((agent) => {
        if (agent.roleId === role) {
          sortedAgents.push(agent);
        }
      });
    });

    return sortedAgents;
  } catch (error) {
    Logger.LogAccessError(`fetchAgentsDataでエラーが発生しました`, error);
    throw error;
  }
};

// Valorant-APIからマップ情報を取得
export const fetchMapsData = async () => {
  try {
    const response_jp = await axios.get(VALORANT_MAPINFO_URL + '?language=ja-JP');

    const maps: MapData[] = await response_jp.data.data
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
              miniMapUrl: mapDetail.displayIcon,
              thumbnailUrl: mapDetail.splash,
            };
          }
        }
      )
      .filter((map: MapData): map is MapData => map !== null); // null を除外

    // マップ名で昇順に並び替え
    maps.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    return maps;
  } catch (error) {
    Logger.LogAccessError(`fetchMapsDataでエラーが発生しました`, error);
    throw error;
  }
};
