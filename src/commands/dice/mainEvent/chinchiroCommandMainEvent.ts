import { ChatInputCommandInteraction } from 'discord.js';
import { generateRandomNum } from '../../../events/common/generateRandomNum';
import { createConcatImage } from '../../../events/common/createConcatImage';
import { chinchiro456Message, chinchiroMessage } from '../../../events/discord/embedMessage';
import { exportChinchiroResult } from '../../../events/dice/exportChinchiroResult';
import { Logger } from '../../../events/common/log';

export const chinchiroCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const isCheat: boolean = interaction.options.getString('cheat') ? true : false;

    if (!isCheat) {
      const randomIndexArray: number[] = await Promise.all(
        Array.from({ length: 3 }, async () => generateRandomNum(1, 6))
      );
      const diceImagePaths: string[] = [];

      for (const randomIndex of randomIndexArray) {
        diceImagePaths.push(`static/img/dice/dice_${randomIndex}.png`);
      }

      // サイコロの画像を作成
      await createConcatImage(diceImagePaths);

      // サイコロを振った結果を出力
      const result = exportChinchiroResult(randomIndexArray);

      // メッセージを作成・送信
      const embed = chinchiroMessage(result);
      await interaction.editReply(embed);

      // イカサマモード
    } else if (isCheat) {
      // サイコロを振った結果を出力
      const result = exportChinchiroResult([4, 5, 6]);

      // メッセージを作成・送信
      const embed = chinchiro456Message(result);
      await interaction.editReply(embed);
    }
  } catch (error) {
    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
    Logger.LogSystemError(`chinchiroCommandMainEventでエラーが発生しました : ${error}`);
  }
};
