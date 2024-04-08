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
    thumbnails: string;
}
//　使うかな
// export interface  Thumbnails{
//     url: string;
//     width: number;
//     height: number;
// }