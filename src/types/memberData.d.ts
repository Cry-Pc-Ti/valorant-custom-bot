export interface MemberData {
  name: string;
  id: string;
  avatarImg: string | null;
}

export interface TeamData {
  attack: MemberData[];
  defense: MemberData[];
}
