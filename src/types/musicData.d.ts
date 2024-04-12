export interface MusicInfo {
    songIndex: number;
    url: string;
    title: string;
    musicImg:  string | null;
    author: YoutubeChannelInfo;
}

export interface YoutubeChannelInfo {
    url: string;
    channelID: string;
    name: string;
    channelThumbnail?: string  | null;
}