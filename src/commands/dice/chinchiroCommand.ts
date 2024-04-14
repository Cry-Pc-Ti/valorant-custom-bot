import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { createConcatImage } from '../../events/common/createConcatImage';
import { exportChinchiroResult } from '../../events/dice/exportChinchiroResult';
import { chinchiroMessage, chinchiro456Message } from '../../events/discord/embedMessage';
import { generateRandomNum } from '../../events/common/generateRandomNum';

// チンチロリンコマンド
export const chinchiroCommand = {
  data: new SlashCommandBuilder()
    .setName('chinchiro')
    .setDescription('ざわ…ざわ…')
    .addStringOption((option) =>
      option
        .setName('cheat')
        .setDescription('魔法の賽を...!!')
        .addChoices({ name: 'この力がほしい...!!', value: 'true' })
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const { options } = interaction;

      const isCheat: boolean = options.getString('cheat') ? true : false;

      if (!isCheat) {
        const randomIndexArray: number[] = await Promise.all(
          Array.from({ length: 3 }, async () => await generateRandomNum(1, 6))
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
        const result = exportChinchiroResult([1, 2, 3]);

        // メッセージを作成・送信
        const embed = chinchiro456Message(result);
        await interaction.editReply(embed);
      }
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
