// モジュールをインポート
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { MapData } from '../../types/valorantAgentData';
import { mapMessage } from '../../events/embedMessage';
import { valorantMaps } from '../../data/valorantMaps';

// マップ選択コマンド
export const mapSelectCommand = {
  // コマンドの設定
  data: new SlashCommandBuilder().setName('map').setDescription('マップをランダムに選択します').toJSON(),

  // コマンドの実行
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      // マップをランダムに選択
      const randomMap: MapData = valorantMaps[Math.floor(Math.random() * valorantMaps.length)];

      // メッセージを作成
      const embed = mapMessage(randomMap);

      // メッセージを送信
      await interaction.editReply(embed);
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました\n開発者にお問い合わせください');
      console.error(`mapSelectCommandでエラーが発生しました : ${error}`);
    }
  },
};
