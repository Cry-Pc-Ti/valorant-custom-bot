import { ButtonInteraction } from 'discord.js';
import { getCommandStates, setGuildCommandStates, setStopToStartFlagStates } from '../../store/guildCommandStates';
import { COMMAND_NAME_MUSIC } from '../../commands/music/mainMusicCommand';
import { streamPlaylist } from '../../events/music/playBackMusic';
import { AudioPlayerStatus, getVoiceConnection } from '@discordjs/voice';
import { interactionEditMessages } from '../../events/discord/interactionMessages';

// 次の曲へボタン押下時の処理
export const nextPlayMusicButton = async (interaction: ButtonInteraction) => {
  // guildIdを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const connection = getVoiceConnection(guildId);
  const commandStates = getCommandStates(guildId, COMMAND_NAME_MUSIC);
  const musicCommandInfo = commandStates?.musicCommandInfo;

  if (!commandStates || !musicCommandInfo || !connection) return;

  // playListを再生する処理
  await streamPlaylist(guildId, ++musicCommandInfo.songIndex, true);

  // BOTをdiscordから切断
  connection.destroy();

  return;
};
// 前の曲へボタン押下時の処理
export const prevPlayMusicButton = async (interaction: ButtonInteraction) => {
  // guildIdを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const connection = getVoiceConnection(guildId);
  const commandStates = getCommandStates(guildId, COMMAND_NAME_MUSIC);
  const musicCommandInfo = commandStates?.musicCommandInfo;

  if (!commandStates || !musicCommandInfo || !connection) return;

  // playListを再生する処理
  await streamPlaylist(guildId, --musicCommandInfo.songIndex, true);

  // BOTをdiscordから切断
  connection.destroy();

  return;
};

// 再生/停止ボタン押下時
export const stopPlayMusicButton = async (interaction: ButtonInteraction) => {
  // guildIdを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const commandStates = getCommandStates(guildId, COMMAND_NAME_MUSIC);
  const musicCommandInfo = commandStates?.musicCommandInfo;
  if (!commandStates || !musicCommandInfo) return;

  if (commandStates.musicCommandInfo?.player.state.status === AudioPlayerStatus.Playing) {
    commandStates.musicCommandInfo?.player.pause();
    musicCommandInfo.buttonRowArray[0].components[1].setLabel('再生');
    musicCommandInfo.buttonRowArray[0].components[1].setEmoji('▶');
    setStopToStartFlagStates(guildId, COMMAND_NAME_MUSIC, true);
  } else if (commandStates.musicCommandInfo?.player.state.status === AudioPlayerStatus.Paused) {
    commandStates.musicCommandInfo?.player.unpause();
    musicCommandInfo.buttonRowArray[0].components[1].setLabel('停止');
    musicCommandInfo.buttonRowArray[0].components[1].setEmoji('⏸');
    setStopToStartFlagStates(guildId, COMMAND_NAME_MUSIC, false);
  }
  // メッセージ送信
  interactionEditMessages(commandStates.interaction, commandStates.replyMessageId, {
    components: musicCommandInfo.buttonRowArray,
  });
  return;
};

// 1曲リピートボタン押下時
export const repeatSingleButton = async (interaction: ButtonInteraction) => {
  // guildIdを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const connection = getVoiceConnection(guildId);
  const commandStates = getCommandStates(guildId, COMMAND_NAME_MUSIC);
  const musicCommandInfo = commandStates?.musicCommandInfo;

  if (!commandStates || !musicCommandInfo || !connection) return;

  musicCommandInfo.repeatMode++;
  if (musicCommandInfo.repeatMode >= 3) musicCommandInfo.repeatMode = 0;

  // メッセージを削除
  if (await interaction.channel?.messages.fetch(commandStates.replyMessageId)) {
    await interactionEditMessages(commandStates.interaction, commandStates.replyMessageId, '');
  }

  const labelsAndEmojis = [
    { label: 'リピート', emoji: '🔁' },
    { label: '曲リピート中', emoji: '🔂' },
    { label: 'リストリピート中', emoji: '🔁' },
  ];

  const { label, emoji } = labelsAndEmojis[musicCommandInfo.repeatMode];
  musicCommandInfo.buttonRowArray[1].components[0].setLabel(label);
  musicCommandInfo.buttonRowArray[1].components[0].setEmoji(emoji);

  interactionEditMessages(commandStates.interaction, commandStates.replyMessageId, {
    components: musicCommandInfo.buttonRowArray,
  });
  setGuildCommandStates(guildId, COMMAND_NAME_MUSIC, {
    buttonCollector: commandStates.buttonCollector,
    interaction: commandStates.interaction,
    replyMessageId: commandStates.replyMessageId,
    musicCommandInfo: musicCommandInfo,
  });
  return;
};

// プレイリストのURLを表示
export const showUrlButton = async (interaction: ButtonInteraction) => {
  // guildIdを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const connection = getVoiceConnection(guildId);
  const commandStates = getCommandStates(guildId, COMMAND_NAME_MUSIC);
  const musicCommandInfo = commandStates?.musicCommandInfo;

  if (!commandStates || !musicCommandInfo || !connection) return;

  await interaction.followUp({ content: `${musicCommandInfo.playListInfo.url}`, ephemeral: true });
};
