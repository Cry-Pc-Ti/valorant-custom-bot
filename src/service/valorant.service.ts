import axios from 'axios';
import { AgentData_JP, AgentData_EN, AgentData, MapData } from '../types/valorantData';
import { Logger } from '../events/common/log';

const VALORANT_AGENTINFO_URL = 'https://valorant-api.com/v1/agents';
const VALORANT_MAPINFO_URL = 'https://valorant-api.com/v1/maps';

/**
 * Valorant-APIからエージェント情報を取得
 * @returns {Promise<AgentData[]>} エージェント情報の配列
 * @throws エラーが発生した場合
 */
export const fetchAgentsData = async (): Promise<AgentData[]> => {
  try {
    const response_jp = await axios.get(`${VALORANT_AGENTINFO_URL}?language=ja-JP`);
    const response_en = await axios.get(`${VALORANT_AGENTINFO_URL}?language=en-US`);

    const agents_jp: AgentData_JP[] = response_jp.data.data
      .map(
        (agent: {
          displayName: string;
          role: { displayName: string };
          uuid: string;
          displayIcon: string;
          description: string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          abilities: any;
        }) => {
          if (!agent.displayName || !agent.role || !agent.role.displayName) {
            return null;
          }
          return {
            uuid: agent.uuid,
            name: agent.displayName,
            role: agent.role.displayName,
            iconUrl: agent.displayIcon,
            description: agent.description,
            abilities: agent.abilities,
          };
        }
      )
      .filter((agent: AgentData_JP): agent is AgentData_JP => agent !== null);

    const agents_en: AgentData_EN[] = response_en.data.data
      .map((agent: { displayName: string; role: { displayName: string }; uuid: string }) => {
        if (!agent.displayName || !agent.role || !agent.role.displayName) {
          return null;
        }
        return {
          uuid: agent.uuid,
          id: agent.displayName.toLowerCase(),
          roleId: agent.role.displayName.toLowerCase(),
        };
      })
      .filter((agent: AgentData_EN): agent is AgentData_EN => agent !== null);

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
            description: agent_jp.description,
            abilities: agent_jp.abilities,
          };
        }
        return null;
      })
      .filter((agent): agent is AgentData => agent !== null);

    agents.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

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

/**
 * Valorant-APIからマップ情報を取得
 * @returns {Promise<MapData[]>} マップ情報の配列
 * @throws エラーが発生した場合
 */
export const fetchMapsData = async (): Promise<MapData[]> => {
  try {
    const response_jp = await axios.get(`${VALORANT_MAPINFO_URL}?language=ja-JP`);

    const maps: MapData[] = await response_jp.data.data
      .map(
        (mapDetail: {
          tacticalDescription: null;
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
      .filter((map: MapData) => map);

    maps.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    return maps;
  } catch (error) {
    Logger.LogAccessError(`fetchMapsDataでエラーが発生しました`, error);
    throw error;
  }
};

/**
 * ユーザーのMMR情報を取得
 * @param {string} username - ユーザー名
 * @param {string} tag - タグライン
 * @returns {Promise<any>} MMR情報
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getValorantUserMmr = async (username: string, tag: string): Promise<any> => {
  const encodedUsername = encodeURIComponent(username);
  const encodedTag = encodeURIComponent(tag);
  const VALORANT_VALORANTRANK_URL = `https://api.kyroskoh.xyz/valorant/v1/mmr/ap/${encodedUsername}/${encodedTag}`;

  const valorantRank = await axios.get(VALORANT_VALORANTRANK_URL);

  return valorantRank.data;
};
