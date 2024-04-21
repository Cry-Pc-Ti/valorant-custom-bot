import ytdl from 'ytdl-core';
import { MusicInfo } from '../../types/musicData';
import { AudioPlayer, AudioPlayerStatus, StreamType, createAudioResource, entersState } from '@discordjs/voice';

// 音楽情報をエンコードしdiscordへ流す
export const playBackMusic = async (player: AudioPlayer, musicInfo: MusicInfo) => {
  try {
    const stream = ytdl(musicInfo.id, {
      filter: (format) => format.audioCodec === 'opus' && format.container === 'webm',
      quality: 'highest',
      highWaterMark: 32 * 1024 * 1024,
    });
    const resource = createAudioResource(stream, {
      inputType: StreamType.WebmOpus,
      inlineVolume: true,
    });
    if (resource.volume) resource.volume.setVolumeDecibels(-31);

    player.play(resource);

    await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
    await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error(error);
  }
};

// playerとListenerを削除する
export const deletePlayerInfo = (player: AudioPlayer) => {
  player.stop();
  player.removeAllListeners();
};
