import ytdl from 'ytdl-core';
import { MusicInfo } from '../../types/musicData';
import { AudioPlayer, AudioPlayerStatus, StreamType, createAudioResource, entersState } from '@discordjs/voice';
import { Logger } from '../common/log';

// 音楽情報をエンコードしdiscordへ流す
export const playBackMusic = async (player: AudioPlayer, musicInfo: MusicInfo) => {
  try {
    const stream = ytdl(musicInfo.id, {
      filter: (format) => format.audioCodec === 'opus' && format.container === 'webm',
      quality: 'highestaudio',
      highWaterMark: 32 * 1024 * 1024,
    }).on('error', (error) => {
      Logger.LogSystemError(`ストリームの取得中にエラーが発生しました: ${error}`);
      player.stop(); // エラーが発生した場合、プレイヤーを停止
      return;
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
    console.log(error);
    Logger.LogSystemError(`playBackMusicでエラーが発生しました: ${error}`);
    player.stop(); // エラーが発生した場合、プレイヤーを停止
  }
};

// playerとListenerを削除する
export const deletePlayerInfo = (player: AudioPlayer) => {
  if (player) {
    player.stop();
    player.removeAllListeners();
  }
};
