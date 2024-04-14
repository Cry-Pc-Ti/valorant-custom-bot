import { valorantAgents } from '../common/readJsonData';

export const countAgentsByRole = (role: string) => {
  const roleByAgentsNum = valorantAgents.filter((agent) => agent.role === role).length;
  return roleByAgentsNum;
};

export const countBanAgentsByRole = (role: string, banedAgentIds: string[]) => {
  const roleByBanedAgentsNum = valorantAgents.filter(
    (agent) => agent.role === role && banedAgentIds.includes(agent.id)
  ).length;
  return roleByBanedAgentsNum;
};
