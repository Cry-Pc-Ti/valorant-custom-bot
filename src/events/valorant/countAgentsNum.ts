import { AgentData } from '../../types/valorantData';

export const countAgentsByRole = (agents: AgentData[], role: string) => {
  const roleByAgentsNum = agents.filter((agent) => agent.roleId === role).length;
  return roleByAgentsNum;
};

export const countBanAgentsByRole = (agents: AgentData[], role: string, banedAgentIds: string[]) => {
  const roleByBanedAgentsNum = agents.filter(
    (agent) => agent.roleId === role && banedAgentIds.includes(agent.id)
  ).length;
  return roleByBanedAgentsNum;
};
