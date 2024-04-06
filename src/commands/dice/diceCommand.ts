import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { generateRandomNum } from '../../events/generateRandomNum';
import { diceMessage } from '../../events/embedMessage';

// ダイスコマンド
export const diceCommand = {
  data: new SlashCommandBuilder().setName('dice').setDescription('1から100までの数字をランダムで出します').toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      // 1から100までのランダムな数字を取得
      const randomIndex = await generateRandomNum(1, 100);

      // メッセージを作成・送信
      const embed = diceMessage(randomIndex);
      await interaction.editReply(embed);
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
