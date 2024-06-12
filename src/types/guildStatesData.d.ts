export interface CommandInfo {
  buttonCollector: InteractionCollector<ButtonInteraction<CacheType>>;
  buttonRowArray: ActionRowBuilder<ButtonBuilder>[];
  uniqueId: string;
  interaction: ChatInputCommandInteraction;
  replyMessageId: string;
  musicCommandInfo?: MusicCommandInfo;
  valorantCommandInfo?: ValorantCommandInfo;
}

interface MusicCommandInfo {
  player: AudioPlayer;
  commandFlg: number;
  playListInfo?: PlayListInfo;
  musicInfo?: MusicInfo[];
  playListFlag: boolean;
  channelThumbnails?: {
    [key: string]: string;
  };
  stopToStartFlag: boolean;
  songIndex: number;
  repeatMode: number;
}

interface ValorantCommandInfo {
  attackerChannelId: string;
  defenderChannelId: string;
  teams: TeamData;
}
