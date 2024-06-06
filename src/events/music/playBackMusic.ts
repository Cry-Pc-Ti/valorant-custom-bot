import ytdl from 'ytdl-core';
import { MusicInfo } from '../../types/musicData';
import { AudioPlayer, AudioPlayerStatus, StreamType, createAudioResource, entersState } from '@discordjs/voice';

// 音楽情報をエンコードしdiscordへ流す
export const playMusicStream = async (player: AudioPlayer, musicInfo: MusicInfo) => {
  const stream = ytdl(musicInfo.id, {
    filter: (format) => format.hasAudio && !format.hasVideo,
    quality: 'highestaudio',
    highWaterMark: 32 * 1024 * 1024,
  });

  const resource = createAudioResource(stream, {
    inputType: StreamType.WebmOpus,
    inlineVolume: true,
  });

  if (resource.volume) resource.volume.setVolumeDecibels(-28);

  player.play(resource);

  await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
  await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
};

// playerとListenerを削除する
export const deletePlayerInfo = (player: AudioPlayer) => {
  if (player) {
    player.stop();
    player.removeAllListeners();
  }
};
