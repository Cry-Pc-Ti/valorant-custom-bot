import { AgentData, CompositionData } from '../../types/valorantData';
import { Logger } from '../common/log';

/**
 * 各ロールのエージェントを指定された人数分ランダムに選択 (重複なし)
 * @param {string} agentRole - エージェントのロール (例: 'duelist', 'initiator', 'controller', 'sentinel')
 * @param {number} agentNum - 選択するエージェントの人数
 * @param {CompositionData} composition - 現在のエージェント構成データ
 * @param {AgentData[]} valorantAgents - 利用可能なすべてのエージェントデータの配列
 * @returns {CompositionData} 更新されたエージェント構成データ
 * @throws エラーが発生した場合
 */
export const selectAgentsByRole = (
  agentRole: string,
  agentNum: number,
  composition: CompositionData,
  valorantAgents: AgentData[]
): CompositionData => {
  try {
    const randomAgents: AgentData[] = [];
    let filterAgents: AgentData[] = valorantAgents.filter((agent) => agent.roleId === agentRole);

    for (let i = 0; i < agentNum; i++) {
      // filterAgentsからランダムにエージェントを選択
      const randomIndex = Math.floor(Math.random() * filterAgents.length);

      // 選択したエージェントを格納
      const randomAgent: AgentData = filterAgents[randomIndex];

      // 選択したエージェントをfilterAgentsから削除
      filterAgents = filterAgents.filter((_, index) => index !== randomIndex);

      // 選択したエージェントをrandomAgentsに格納
      randomAgents.push(randomAgent);
    }

    // compositionにエージェントを格納
    composition[agentRole as keyof CompositionData] = randomAgents;

    return composition;
  } catch (error) {
    Logger.LogError(`selectAgentsByRoleでエラーが発生しました`, error);
    return composition;
  }
};
