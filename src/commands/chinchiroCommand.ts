import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getRandomInt } from '../events/getRandomInt';
import { chinchiroMessage } from '../events/embedMessage';
import { createImage } from '../events/createImage';
import { chinchiroResult } from '../events/chinchiroResult';

// チンチロリンコマンド
export const chinchiroCommand = {
  data: new SlashCommandBuilder()
  .setName('chinchiro')
  .setDescription('ざわ…ざわ…')
  .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const randomIndexArray = []
      const imagePaths = []
      for(let i=0;i<=2;i++){
        randomIndexArray.push(await getRandomInt(1, 6));
        imagePaths.push(`img/dice/${randomIndexArray[i]}.png`);
      }
      
      // サイコロの画像を作成
      await createImage(imagePaths)

      // サイコロを振った結果を出力しメッセージを作成・送信
      const embed = chinchiroMessage(await chinchiroResult(randomIndexArray))
      await interaction.editReply(embed);

    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  }
};
