// モジュールをインポート
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { mapMessage } from '../../events/discord/embedMessage';
import { MapData } from '../../types/valorantData';
import { generateRandomNum } from '../../events/common/generateRandomNum';
import { getMapInfo } from '../../service/valorant.service';

// マップ選択コマンド
export const mapSelectCommand = {
  // コマンドの設定
  data: new SlashCommandBuilder().setName('map').setDescription('マップをランダムに選択します').toJSON(),

  // コマンドの実行
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

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
    } catch (error) {
      console.log(error);
      interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
      console.error(`mapSelectCommandでエラーが発生しました : ${error}`);
    }
  },
};
