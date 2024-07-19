export interface AgentData {
  name: string;
  id: string;
  role: string;
  roleId: string;
  uuid: string;
  iconUrl: string;
  description: string;
  abilities: abilities[];
}

export interface AgentData_JP {
  name: string;
  role: string;
  uuid: string;
  iconUrl: string;
  description: string;
  abilities: abilities[];
}

export interface AgentData_EN {
  id: string;
  roleId: string;
  uuid: string;
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
  miniMapUrl: string;
  thumbnailUrl: string;
}

interface APIMapDetail {
  tacticalDescription: string | null;
  uuid: string;
  displayName: string;
  displayIcon: string;
  splash: string;
}

interface abilities {
  slot: string;
  displayName: string;
  description: string;
  displayIcon: string;
}
