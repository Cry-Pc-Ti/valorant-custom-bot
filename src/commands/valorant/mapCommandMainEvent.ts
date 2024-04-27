import { ChatInputCommandInteraction } from 'discord.js';
import { MapData } from '../../types/valorantData';
import { getMapInfo } from '../../service/valorant.service';
import { generateRandomNum } from '../../events/common/generateRandomNum';
import { mapMessage } from '../../events/discord/embedMessage';
import { Logger } from '../../events/common/log';

export const mapCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    // valorant-apiからMAP情報を取得
    const mapInfo: MapData[] = await getMapInfo();

    // マップをランダムに選択
    const randomMap: MapData = mapInfo[generateRandomNum(0, mapInfo.length - 1)];
    // const randomMap: MapData = valorantMaps[generateRandomNum(0, valorantMaps.length - 1)]

    // メッセージを作成
    const embed = mapMessage(randomMap);

    // メッセージを送信
    await interaction.editReply(embed);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
    Logger.LogSystemError(error);
  }
};
