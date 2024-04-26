import { ChatInputCommandInteraction } from 'discord.js';
import { CLIENT_ID } from '../../modules/discordModule';
import { Logger } from '../../events/common/log';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(error);
  }
};
