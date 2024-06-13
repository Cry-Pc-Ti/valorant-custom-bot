/**
 * 音楽情報を保持するインターフェース
 */
export interface MusicInfo {
  /** 曲のインデックス */
  songIndex: number;
  /** 音楽のID */
  id: string;
  /** 音楽のURL（オプション） */
  url?: string;
  /** 音楽のタイトル */
  title: string;
  /** 音楽のサムネイル（オプション） */
  musicImg?: string;
  /** 再生時間のフォーマット */
  durationFormatted: string;
  /** チャンネル情報 */
  author: YoutubeChannelInfo;
  /** 関連動画のIDリスト */
  relatedVideosIDlist: string[];
}

/**
 * YouTubeチャンネル情報を保持するインターフェース
 */
export interface YoutubeChannelInfo {
  /** チャンネルのURL（オプション） */
  url?: string;
  /** チャンネルのID（オプション） */
  channelID?: string;
  /** チャンネルの名前 */
  name: string;
  /** チャンネルのサムネイル（オプション） */
  channelThumbnail?: string | null;
}
/**
 * プレイリスト情報を保持するインターフェース
 */
export interface PlayListInfo {
  /** プレイリストのID */
  playListId: number;
  /** プレイリストのURL */
  url: string;
  /** プレイリストのサムネイル */
  thumbnail: string | undefined;
  /** プレイリストのタイトル */
  title: string;
  /** プレイリストの動画の数 */
  videosLength: string;
  /** 検索ワード（オプション） */
  searchWord?: string;
  /** プレイリストの説明（オプション） */
  description?: string;
  /** ランキングフラグ（オプション） */
  rankingFlag?: boolean;
  /** 音楽情報の配列 */
  musicInfo: MusicInfo[];
}
