/**
 * コマンドの情報を保持するインターフェース
 */
export interface CommandInfo {
  /** ボタンインタラクションのコレクター */
  buttonCollector: InteractionCollector<ButtonInteraction<CacheType>>;
  /** ボタンの配列 */
  buttonRowArray: ActionRowBuilder<ButtonBuilder>[];
  /** ボタンが持つ一意なID */
  uniqueId: string;
  /** チャット入力コマンドのインタラクション */
  interaction: ChatInputCommandInteraction;
  /** 返信メッセージのID */
  replyMessageId: string;
  /** 音楽コマンド情報（オプション） */
  musicCommandInfo?: MusicCommandInfo;
  /** VALORANTコマンド情報（オプション） */
  valorantCommandInfo?: ValorantCommandInfo;
}
/**
 * 音楽コマンド情報を保持するインターフェース
 */
interface MusicCommandInfo {
  /** オーディオプレイヤー */
  player: AudioPlayer;
  /** コマンドフラグ */
  commandFlg: number;
  /** プレイリスト情報（オプション） */
  playListInfo?: PlayListInfo;
  /** 音楽情報の配列（オプション） */
  musicInfo?: MusicInfo[];
  /** プレイリストフラグ */
  playListFlag: boolean;
  /** チャンネルのサムネイル（オプション） */
  channelThumbnails?: {
    [key: string]: string;
  };
  /** 停止/再生のフラグ */
  stopToStartFlag: boolean;
  /** 曲のインデックス */
  songIndex: number;
  /** リピートモード */
  repeatMode: number;
}

/**
 * VALORANTコマンド情報を保持するインターフェース
 */
interface ValorantCommandInfo {
  /** アタッカーチャンネルのID */
  attackerChannelId: string;
  /** ディフェンダーチャンネルのID */
  defenderChannelId: string;
  /** チームデータ */
  teams: TeamData;
}
