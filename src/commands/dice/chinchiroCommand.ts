import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getRandomInt } from '../../events/getRandomInt';
import { chinchiro456Message, chinchiroMessage } from '../../events/embedMessage';
import { createImage } from '../../events/createConcatImage';
import { exportChinchiroResult } from '../../events/exportChinchiroResult';

// チンチロリンコマンド
export const chinchiroCommand = {
  data: new SlashCommandBuilder()
    .setName('chinchiro')
    .setDescription('ざわ…ざわ…')
    .addBooleanOption((option) => option.setName('cheat').setDescription('魔法の賽を...!!'))
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const { options } = interaction;

      const isCheat: boolean = options.getBoolean('cheat') ?? false;

      if (!isCheat) {
        const randomIndexArray: number[] = await Promise.all(
          Array.from({ length: 3 }, async () => await getRandomInt(1, 6))
        );
        const diceImagePaths: string[] = [];

        for (const randomIndex of randomIndexArray) {
          diceImagePaths.push(`img/dice/dice_${randomIndex}.png`);
        }

        // サイコロの画像を作成
        await createImage(diceImagePaths);

        // サイコロを振った結果を出力
        const result = await exportChinchiroResult(randomIndexArray);

        // メッセージを作成・送信
        const embed = chinchiroMessage(result);
        await interaction.editReply(embed);
      } else if (isCheat) {
        // メッセージを作成・送信
        const embed = chinchiro456Message();
        await interaction.editReply(embed);
      }
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
