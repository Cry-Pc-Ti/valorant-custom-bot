export interface MusicInfo {
  songIndex: number;
  id: string;
  url?: string;
  title: string;
  musicImg?: string;
  durationFormatted: string;
  author: YoutubeChannelInfo;
  relatedVideosIDlist: string[];
}

export interface YoutubeChannelInfo {
  url?: string;
  channelID?: string;
  name: string;
  channelThumbnail?: string | null;
}

export interface PlayListInfo {
  playListId: number;
  url: string;
  thumbnail: string | undefined;
  title: string;
  videosLength: string;
  searchWord?: string;
  description?: string;
  rankingFlag?: boolean;
  musicInfo: MusicInfo[];
}
