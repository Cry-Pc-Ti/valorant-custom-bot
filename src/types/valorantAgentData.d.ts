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

export interface MemberData {
  name: string;
  id: string;
  avatarImg: string | null;
}

export interface MemberAllocationData {
  attack: MemberData[];
  defense: MemberData[];
}
