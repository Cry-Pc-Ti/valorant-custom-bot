import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { generateRandomNum } from '../../events/generateRandomNum';
import { addTextToImage } from '../../events/addTextToImage';
import { diceMessage } from '../../events/embedMessage';

// ダイスコマンド
export const diceCommand = {
  data: new SlashCommandBuilder().setName('dice').setDescription('1から100までの数字をランダムに出します').toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      // 1から100までのランダムな数字を取得
      const randomNum = await generateRandomNum(1, 100);

      // 画像を作成
      await addTextToImage(randomNum);

      // メッセージを作成・送信
      const embed = diceMessage();
      await interaction.editReply(embed);
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
