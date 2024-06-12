export interface AgentData {
  name: string;
  nameId: string;
  roleName: string;
  roleId: string;
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
  displayIcon: string;
  mapThumbnail: string;
}

interface APIMapDetail {
  tacticalDescription: string | null;
  uuid: string;
  displayName: string;
  displayIcon: string;
  splash: string;
}
