import { ChatInputCommandInteraction } from 'discord.js';
import { CLIENT_ID } from '../../../modules/discordModule';
import { Logger } from '../../../events/common/log';

/**
 * BOTをボイスチャンネルから切断するコマンドのメインイベント
 *
 * @param interaction - チャット入力コマンドのインタラクション
 */
export const disconnectCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const botJoinVoiceChannelId = await interaction.guild?.members.fetch(CLIENT_ID);
    if (botJoinVoiceChannelId?.voice.channelId) {
      await botJoinVoiceChannelId?.voice.disconnect();
      await interaction.editReply('BOTをVCから切断しました。');
      return;
    }
    await interaction.editReply('BOTがVCにいません。');
    return;
  } catch (error) {
    Logger.LogSystemError(`disconnectCommandMainEventでエラーが発生しました : ${error}`);
    await interaction.editReply({
      embeds: [],
      files: [],
      content: '処理中にエラーが発生しました。再度コマンドを入力してください。',
    });
  }
};
