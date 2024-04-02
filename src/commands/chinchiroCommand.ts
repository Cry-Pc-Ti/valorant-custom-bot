import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getRandomInt } from '../events/getRandomInt';
import { chinchiroMessage } from '../events/embedMessage';
import { createImage } from '../events/createImage';


// ちんちろ
export const chinchiroCommand = {
  data: new SlashCommandBuilder()
  .setName('chinchiro')
  .setDescription('ざわ…ざわ…')
  .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const randomIndexList = []
      for(let i=0;i<=2;i++){
        randomIndexList.push(await getRandomInt(1, 6));
      }
      const imagePaths = [`img/dice/${randomIndexList[0]}.png`,`img/dice/${randomIndexList[1]}.png`,`img/dice/${randomIndexList[2]}.png`]
      // サイコロの画像を作成
      await createImage(imagePaths)

      // メッセージを作成・送信
      const embed = chinchiroMessage()
      await interaction.editReply(embed);

    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  }
};
