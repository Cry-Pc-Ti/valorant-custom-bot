import ytdl from "ytdl-core";
import { MusicInfo } from "../types/musicData";
import { AudioPlayer, AudioPlayerStatus, StreamType, VoiceConnection, createAudioPlayer, createAudioResource, entersState } from "@discordjs/voice";


export const playMusic = async (player:AudioPlayer,musicInfo: MusicInfo) => {
    const stream = ytdl(musicInfo.url, {
        filter: format => format.audioCodec === 'opus' && format.container === 'webm',
        quality: 'highest',
        highWaterMark: 32 * 1024 * 1024,
    });
    const resource = createAudioResource(stream, {
        inputType: StreamType.WebmOpus
    });
    player.play(resource);
    await entersState(player,AudioPlayerStatus.Playing, 10 * 1000);
    await entersState(player,AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
};

