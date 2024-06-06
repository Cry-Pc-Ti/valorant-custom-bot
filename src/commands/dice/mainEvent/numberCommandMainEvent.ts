import { ChatInputCommandInteraction } from 'discord.js';
import { generateRandomNum } from '../../../events/common/generateRandomNum';
import { addTextToImage } from '../../../events/dice/addTextToImage';
import { diceMessage } from '../../../events/discord/embedMessage';
import { Logger } from '../../../events/common/log';

export const numberCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
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

    // 数字に応じた画像を作成
    await addTextToImage(randomNum);

    // メッセージを作成・送信
    const embed = diceMessage(message, randomNum);
    await interaction.editReply(embed);
  } catch (error) {
    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
    Logger.LogSystemError(`numberCommandMainEventでエラーが発生しました : ${error}`);
  }
};
