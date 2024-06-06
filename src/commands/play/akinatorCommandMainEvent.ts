import { ChatInputCommandInteraction } from 'discord.js';
<<<<<<< HEAD
import { Logger } from '../../events/common/log';
=======
>>>>>>> origin/master

export const akinatorCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const akinator = require('discord.js-akinator');
<<<<<<< HEAD
  try {
    await akinator(interaction, {
      language: 'ja',
      childMode: false,
      gameType: 'character',
      useButtons: true,
      embedColor: '#fd4556',
      translationCaching: {
        enabled: true,
        path: './translationCache',
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    Logger.LogSystemError(`akinatorCommandMainEventでエラーが発生しました : ${error}`);
    await interaction.channel?.send('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
=======
  await akinator(interaction, {
    language: 'ja',
    childMode: false,
    gameType: 'character',
    useButtons: true,
    embedColor: '#fd4556',
    translationCaching: {
      enabled: true,
      path: './translationCache',
    },
  });
>>>>>>> origin/master
};
