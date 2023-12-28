// モジュールをインポート
import { SlashCommandBuilder, ChatInputCommandInteraction } from '../modules/discordModule';
import { MapData } from '../types/valorantAgentData';
import { mapMessage } from '../events/embedMessage';
import { valorantMaps } from '../data/valorantMaps';

export const mapSelectCommand = {
  // コマンドの設定
  data: new SlashCommandBuilder()
    .setName('map')
    .setDescription('マップをランダムに選択します')
    .toJSON(),

  // コマンドの実行
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      // マップをランダムに選択
      const randomMap: MapData = valorantMaps[Math.floor(Math.random() * valorantMaps.length)];

      // メッセージを作成・送信
      const embedMessage = mapMessage(randomMap);
      await interaction.editReply(embedMessage);
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
