export interface MusicInfo {
    url: string;
    title: string;
    musicImg:  string;
    author: YoutubeChannelInfo;
}

export interface YoutubeChannelInfo {
    url: string;
    channelID: string;
    name: string;
    channelimg?: Thumbnails[];
}

export interface  Thumbnails{
    url: string;
}