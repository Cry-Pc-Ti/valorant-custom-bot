import ytdl from "ytdl-core";
import { MusicInfo } from "../types/musicData";
import { AudioPlayer, AudioPlayerStatus, StreamType, createAudioResource, entersState } from "@discordjs/voice";

// 音楽情報をエンコードしdiscordへ流す
export const playMusic = async (player: AudioPlayer,musicInfo: MusicInfo) => {
    try {
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

    } catch (error) {
        console.error(error)
    }
};

export const deletePlayerInfo = async (player: AudioPlayer) => {
        // playerを削除する。
        player.stop();
        // Listenerをすべて削除する。
        player.removeAllListeners();
}
