import { valorantAgents } from '../data/valorantAgents';
import { AgentData, CompositionData } from '../types/valorantAgentData';

// 各ロールのエージェントを指定された人数分ランダムに選択 (重複なし)
export const pickRandomAgents = (
  agentRole: string,
  agentNum: number,
  composition: CompositionData
): CompositionData => {
  const randomAgents: AgentData[] = [];
  let filterAgents: AgentData[] = valorantAgents.filter((agent) => agent.role === agentRole);

  for (let i = 0; i < agentNum; i++) {
    const randomIndex = Math.floor(Math.random() * filterAgents.length);
    const randomAgent: AgentData = filterAgents[randomIndex];

    // 選択したエージェントをfilterAgentsから削除
    filterAgents = filterAgents.filter((_, index) => index !== randomIndex);

    randomAgents.push(randomAgent);
  }

  composition[agentRole as keyof CompositionData] = randomAgents;
  return composition;
};
