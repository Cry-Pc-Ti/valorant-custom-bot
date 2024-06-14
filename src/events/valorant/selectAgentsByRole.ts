import { AgentData, CompositionData } from '../../types/valorantData';
import { Logger } from '../common/log';

// 各ロールのエージェントを指定された人数分ランダムに選択 (重複なし)
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
