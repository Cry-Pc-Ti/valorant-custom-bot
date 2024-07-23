/**
 * Valorantユーザーの情報を表します。
 */
export interface ValorantUser {
  /** ユーザーのID */
  id: string;
  /** ユーザー名 */
  userName: string;
  /** 表示名 */
  displayName: string;
  /** ランク */
  rank: string;
  /** Riot ID */
  riotId: string;
  /** Riot IDのタグ */
  riotIdTag: string;
  /** ユーザーアイコンのURLまたはnull */
  userIcon: string | null;
  /** ランクの数値 (nullの場合もあり) */
  rankNum: number | null;
  /** ランクRR */
  rankRr: number;
}

/**
 * Valorantユーザーのレスポンスデータを表します。
 */
export interface ValorantUserResponse {
  /** ユーザーのID */
  id: string;
  /** ユーザー名 */
  userName: string;
  /** 表示名 */
  displayName: string;
  /** Riot ID */
  riotId: string;
  /** Riot IDのタグ */
  riotIdTag: string;
  /** ランク */
  rank: string;
  /** ランクの数値 (nullの場合もあり) */
  rankNum: number | null;
  /** ランクRR */
  rankRr: number;
  /** データの最終更新日時 */
  updateAt: Date;
}

/**
 * チームのパターンを表します。
 */
export interface TeamPattern {
  /** チームデータ */
  teams: TeamData;
  /** 攻撃チームのスコア */
  attackScore: number;
  /** 防御チームのスコア */
  defenseScore: number;
}

/**
 * チームデータを表します。
 */
export interface TeamData {
  /** 攻撃チームのプレイヤーリスト */
  attack: Player[];
  /** 防御チームのプレイヤーリスト */
  defense: Player[];
}

/**
 * プレイヤーの情報を表します。
 */
export interface Player {
  /** プレイヤーのID */
  id: string;
  /** プレイヤーのスコア */
  rankScore: number;
  /** ランク */
  rank: string;
  /** ランクの数値 (nullの場合もあり) */
  rankNum: number | null;
  /** ランクRR */
  rankRr: number;
}

/**
 * ランク情報を表します。
 */
export interface RankInfo {
  /** ランク */
  rank: string;
  /** ランクの数値 (nullの場合もあり) */
  rankNum: number | null;
  /** ランクRR */
  rankRr: number;
}

/**
 * デフォルトのランク情報を表します。
 */
export interface DefaultRankInfo {
  /** ID */
  id: string;
  /** ランク */
  rank: string;
  /** ランクの数値 (nullの場合もあり) */
  rankNumber: number | null;
  /** ランクRR */
  rr: number;
}

/**
 * メンバーのデータを表します。
 */
export interface MemberData {
  /** メンバーの名前 */
  name: string;
  /** メンバーのID */
  id: string;
  /** メンバーのアバター画像のURLまたはnull */
  avatarImg: string | null;
}
