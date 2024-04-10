export interface AgentData {
  name: string;
  id: string;
  role: string;
  abilities?: AbilitiesData[];
}

export interface RoleData {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
}

export interface AbilitiesData {
  slot: string;
  displayName: string;
  description: string;
  displayIcon: string;
}

export interface CompositionData {
  duelist: AgentData[];
  initiator: AgentData[];
  controller: AgentData[];
  sentinel: AgentData[];
}

export interface MapData {
  name: string;
  id: string;
}
