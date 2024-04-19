import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { exportChinchiroResult } from '../../events/dice/exportChinchiroResult';
import { chinchiro456Message, chinchiroMessage, diceMessage } from '../../events/discord/embedMessage';
import { createConcatImage } from '../../events/common/createConcatImage';
import { generateRandomNum } from '../../events/common/generateRandomNum';
import { addTextToImage } from '../../events/dice/addTextToImage';

export const mainDiceCommand = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('音楽関連のコマンドです。')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('chinchiro')
        .setDescription('ざわ…ざわ…')
        .addStringOption((option) =>
          option
            .setName('cheat')
            .setDescription('魔法の賽を...!!')
            .addChoices({ name: 'この力がほしい...!!', value: 'true' })
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('number').setDescription('1から100までの数字をランダムに出します')
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    if (interaction.options.getSubcommand() === 'chinchiro') {
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
        console.error(error);
      }
    } else if (interaction.options.getSubcommand() === 'number') {
      try {
        // 1から100までのランダムな数字を取得
        const randomNum = generateRandomNum(1, 100);

        let message = '';

        if (randomNum >= 91 && randomNum <= 100) {
          message = 'Qué padre！ やったぜウィング！';
        } else if (randomNum >= 31 && randomNum <= 89) {
          message = 'やるな！ウィング！';
        } else if (randomNum >= 11 && randomNum <= 30) {
          message = 'よくがんばった...！ ウィング！';
        } else if (randomNum >= 1 && randomNum <= 10) {
          message = 'それはないぜ... ウィング...';
        }

        // 画像を作成
        await addTextToImage(randomNum);

        // メッセージを作成・送信
        const embed = diceMessage(message, randomNum);
        await interaction.editReply(embed);
      } catch (error) {
        await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
        console.error(`agentPickCommandでエラーが発生しました : ${error}`);
      }
    }
  },
};
