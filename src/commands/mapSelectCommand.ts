// モジュールをインポート
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
} from '../modules/discordModule';
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

      // メッセージを作成
      const embedMessage: { embeds: EmbedBuilder[]; files: AttachmentBuilder[] } =
        mapMessage(randomMap);

      // メッセージを送信
      await interaction.editReply(embedMessage);
    } catch (error: unknown) {
      await interaction.editReply('処理中にエラーが発生しました\n開発者にお問い合わせください');
      console.error(`mapSelectCommandでエラーが発生しました : ${error}`);
    }
  },
};
