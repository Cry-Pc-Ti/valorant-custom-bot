export interface AgentData {
  name: string;
  id: string;
  role: string;
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

export interface memberData {
  name: string | undefined;
  id: string | undefined;
}

export interface memberAllocationData {
  attack: memberData[];
  defense: memberData[];
}
