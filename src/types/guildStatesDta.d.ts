export interface CommandInfo {
  buttonCollector: InteractionCollector<ButtonInteraction<CacheType>>;
  interaction: ChatInputCommandInteraction;
  replyMessageId: string;
  musicCommandInfo?: MusicCommandInfo;
}

interface MusicCommandInfo {
  player: AudioPlayer;
  commandFlg: number;
  buttonRowArray: ActionRowBuilder<ButtonBuilder>[];
  playListInfo?: PlayListInfo;
  musicInfo?: MusicInfo[];
  channelThumbnails?: {
    [key: string]: string;
  };
  stopToStartFlag: boolean;
  uniqueId: string;
  songIndex: number;
  repeatMode: number;
}
