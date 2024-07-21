export interface ValorantUser {
  id: string;
  userName: string;
  displayName: string;
  rank: string;
  riotId: string;
  riotIdTag: string;
  userIcon: string | null;
  rankNum: number | null;
  rankRr: number;
}

export interface ValorantUserResponse {
  id: string;
  userName: string;
  displayName: string;
  rank: string;
  riotId: string;
  riotIdTag: string;
  rankNum: number | null;
  rankRr: number;
  updateAt: Date;
}
