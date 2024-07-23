import { AgentData } from '../../types/valorantData';

/**
 * 指定された役割に属するエージェントの数をカウントします。
 *
 * @param agents - エージェントデータの配列。
 * @param role - カウントする役割のID。
 * @returns 指定された役割に属するエージェントの数。
 */
export const countAgentsByRole = (agents: AgentData[], role: string) => {
  const roleByAgentsNum = agents.filter((agent) => agent.roleId === role).length;
  return roleByAgentsNum;
};

/**
 * 指定された役割に属し、かつ禁止されているエージェントの数をカウントします。
 *
 * @param agents - エージェントデータの配列。
 * @param role - カウントする役割のID。
 * @param banedAgentIds - 禁止されているエージェントのIDの配列。
 * @returns 指定された役割に属し、かつ禁止されているエージェントの数。
 */
export const countBanAgentsByRole = (agents: AgentData[], role: string, banedAgentIds: string[]) => {
  const roleByBanedAgentsNum = agents.filter(
    (agent) => agent.roleId === role && banedAgentIds.includes(agent.id)
  ).length;
  return roleByBanedAgentsNum;
};
