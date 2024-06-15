import ytdl from 'ytdl-core';
import { MusicInfo } from '../../types/musicData';
import { AudioPlayer, AudioPlayerStatus, StreamType, createAudioResource, entersState } from '@discordjs/voice';
import {
  deleteGuildCommandStates,
  getCommandStates,
  getRepeatModeStates,
  setGuildCommandStates,
  setRepeatModeStates,
  setReplyMessageIdStates,
  setSongIndexStates,
} from '../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../../commands/music/mainMusicCommand';
import { musicInfoPlayListMessage } from '../discord/embedMessage';
import { donePlayerInteractionEditMessages, interactionEditMessages } from '../discord/interactionMessages';
import { Logger } from '../common/log';

/**
 * 音楽情報をエンコードしDiscordへストリーミングする関数
 *
 * @param player - オーディオプレイヤー
 * @param musicInfo - 音楽情報
 */
export const playMusicStream = async (player: AudioPlayer, musicInfo: MusicInfo) => {
  try {
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
  } catch (error) {
    return;
  }
};

/**
 * プレイヤーとリスナーを削除する関数
 *
 * @param player - オーディオプレイヤー
 */
export const deletePlayerInfo = (player: AudioPlayer) => {
  if (player) {
    player.stop();
    player.removeAllListeners();
  }
};
/**
 * プレイリストをストリーミングする関数
 *
 * @param guildId - ギルドID
 * @param songIndex - 曲のインデックス
 * @param buttonFlag - ボタンフラグ
 */
export const streamPlaylist = async (guildId: string, songIndex: number, buttonFlag: boolean) => {
  try {
    setSongIndexStates(guildId, COMMAND_NAME_MUSIC, songIndex);

    const commandStates = getCommandStates(guildId, COMMAND_NAME_MUSIC);
    const musicCommandInfo = commandStates?.musicCommandInfo;
    if (!commandStates || !musicCommandInfo) return;

    if (buttonFlag) {
      // PlayerとListenerを削除
      deletePlayerInfo(musicCommandInfo.player);

      if (musicCommandInfo.stopToStartFlag) {
        commandStates.buttonRowArray[0].components[1].setLabel('停止');
        commandStates.buttonRowArray[0].components[1].setEmoji('⏸');
      }
      if (musicCommandInfo.repeatMode === 1) {
        // ボタンがリピート中ボタンだった時リピートボタンに変更
        setRepeatModeStates(guildId, COMMAND_NAME_MUSIC, 0);
        commandStates.buttonRowArray[1].components[0].setLabel('リピート');
        commandStates.buttonRowArray[1].components[0].setEmoji('🔁');
      }
    }
    do {
      // 次へと前へのボタンの制御
      if (musicCommandInfo?.songIndex === 0 && musicCommandInfo.playListInfo.musicInfo.length === 1) {
        commandStates.buttonRowArray[0].components[0].setDisabled(true);
        commandStates.buttonRowArray[0].components[2].setDisabled(true);
      } else if (musicCommandInfo?.songIndex === 0 && musicCommandInfo.playListInfo.musicInfo.length > 1) {
        commandStates.buttonRowArray[0].components[0].setDisabled(true);
        commandStates.buttonRowArray[0].components[2].setDisabled(false);
      } else if (
        musicCommandInfo?.songIndex !== 0 &&
        musicCommandInfo.playListInfo.musicInfo.length - 1 === musicCommandInfo?.songIndex
      ) {
        commandStates.buttonRowArray[0].components[0].setDisabled(false);
        commandStates.buttonRowArray[0].components[2].setDisabled(true);
      } else {
        commandStates.buttonRowArray[0].components[0].setDisabled(false);
        commandStates.buttonRowArray[0].components[2].setDisabled(false);
      }

      // 音楽情報を取得
      const musicInfo = musicCommandInfo.playListInfo.musicInfo[musicCommandInfo.songIndex];

      // 音楽メッセージを作成
      const embed = musicInfoPlayListMessage(
        musicCommandInfo.playListInfo,
        commandStates.buttonRowArray,
        musicCommandInfo.songIndex + 1,
        musicCommandInfo.channelThumbnails?.[musicInfo.id],
        musicCommandInfo.commandFlg
      );
      // 音楽メッセージを送信
      commandStates.interaction.channel?.messages.edit(commandStates.replyMessageId, embed).catch(() => {
        commandStates.interaction.channel?.send(embed).then((res: { id: string }) => {
          setReplyMessageIdStates(guildId, COMMAND_NAME_MUSIC, res.id);
          commandStates.replyMessageId = res.id;
        });
      });

      // データをstatesに登録
      setGuildCommandStates(guildId, COMMAND_NAME_MUSIC, {
        buttonCollector: commandStates.buttonCollector,
        buttonRowArray: commandStates.buttonRowArray,
        uniqueId: commandStates.uniqueId,
        interaction: commandStates.interaction,
        replyMessageId: commandStates.replyMessageId,
        musicCommandInfo: musicCommandInfo,
      });

      // リピートフラグがtrueの時曲を再生
      do {
        await playMusicStream(musicCommandInfo.player, musicInfo).catch(async (error) => {
          if (error.message === 'Status code: 410') {
            setRepeatModeStates(guildId, COMMAND_NAME_MUSIC, 0);
            await interactionEditMessages(
              commandStates.interaction,
              commandStates.replyMessageId,
              `ポリシーに反しているため「${musicInfo.title}」を飛ばしました。`
            );
            return;
          } else if (
            error.message === 'The operation was aborted' ||
            error.message === 'Invalid regular expression: missing /'
          )
            return;
          Logger.LogError(`【${guildId}】streamPlaylist・playMusicStream内でエラーが発生しました`, error);
          musicCommandInfo.player.stop();
        });
      } while (getRepeatModeStates(guildId, COMMAND_NAME_MUSIC) === 1);

      // indexの更新と音楽が再生しきったら戻す。
      if (
        musicCommandInfo.playListInfo.musicInfo.length - 1 === musicCommandInfo.songIndex &&
        getRepeatModeStates(guildId, COMMAND_NAME_MUSIC) === 2
      ) {
        musicCommandInfo.songIndex = 0;
        setSongIndexStates(guildId, COMMAND_NAME_MUSIC, musicCommandInfo.songIndex);
      } else {
        musicCommandInfo.songIndex++;
        setSongIndexStates(guildId, COMMAND_NAME_MUSIC, musicCommandInfo.songIndex);
      }
    } while (
      musicCommandInfo.playListInfo.musicInfo.length !== musicCommandInfo.songIndex ||
      getRepeatModeStates(guildId, COMMAND_NAME_MUSIC) === 2
    );

    // PlayerとListenerを削除
    deletePlayerInfo(musicCommandInfo.player);

    // 再生完了した際メッセージを送信
    await donePlayerInteractionEditMessages(commandStates.interaction, commandStates.replyMessageId);

    deleteGuildCommandStates(guildId, COMMAND_NAME_MUSIC);
  } catch (error) {
    Logger.LogError(`【${guildId}】streamPlaylistでエラーが発生しました`, error);
  }
};
