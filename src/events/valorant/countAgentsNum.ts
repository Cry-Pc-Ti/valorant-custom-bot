import { valorantAgents } from '../common/readJsonData';

export const countAgentsByRole = (role: string) => {
  const roleByAgentsNum = valorantAgents.filter((agent) => agent.roleId === role).length;
  return roleByAgentsNum;
};

export const countBanAgentsByRole = (role: string, banedAgentIds: string[]) => {
  const roleByBanedAgentsNum = valorantAgents.filter(
    (agent) => agent.roleId === role && banedAgentIds.includes(agent.nameId)
  ).length;
  return roleByBanedAgentsNum;
};
