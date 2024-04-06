export interface MemberData {
  name: string;
  id: string;
  avatarImg: string | null;
}

export interface MemberAllocationData {
  attack: MemberData[];
  defense: MemberData[];
}
