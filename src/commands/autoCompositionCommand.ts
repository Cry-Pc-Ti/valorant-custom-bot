// モジュールをインポート
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
} from '../modules/discordModule';
import { selectAgentsByRole } from '../event/selectAgentsByRole';
import { CompositionData } from '../types/valorantAgentData';
import { createCompositionImage } from '../event/createCompositionImage';
import { compositionMessage } from '../event/embedMessage';

export const autoCompositionCommands = {
  data: new SlashCommandBuilder()
    .setName('composition')
    .setDescription(
      '指定された各クラスの人数にともない、自動的に構成を作成します\n(各クラスの合計人数が5人になるようにしてください)'
    )
    .addNumberOption((option) =>
      option
        .setName('duelist')
        .setDescription('デュエリストの人数を指定してください')
        .setChoices(
          { name: '0', value: 0 },
          { name: '1', value: 1 },
          { name: '2', value: 2 },
          { name: '3', value: 3 },
          { name: '4', value: 4 },
          { name: '5', value: 5 }
        )
    )
    .addNumberOption((option) =>
      option
        .setName('initiator')
        .setDescription('イニシエーターの人数を指定してください')
        .setChoices(
          { name: '0', value: 0 },
          { name: '1', value: 1 },
          { name: '2', value: 2 },
          { name: '3', value: 3 },
          { name: '4', value: 4 },
          { name: '5', value: 5 }
        )
    )
    .addNumberOption((option) =>
      option
        .setName('controller')
        .setDescription('コントローラーの人数を指定してください')
        .setChoices(
          { name: '0', value: 0 },
          { name: '1', value: 1 },
          { name: '2', value: 2 },
          { name: '3', value: 3 },
          { name: '4', value: 4 },
          { name: '5', value: 5 }
        )
    )
    .addNumberOption((option) =>
      option
        .setName('sentinel')
        .setDescription('センチネルの人数を指定してください')
        .setChoices(
          { name: '0', value: 0 },
          { name: '1', value: 1 },
          { name: '2', value: 2 },
          { name: '3', value: 3 },
          { name: '4', value: 4 },
          { name: '5', value: 5 }
        )
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const { options } = interaction;

      // 各ロールの人数を取得
      let duelistNum: number | null = options.getNumber('duelist');
      if (!duelistNum) duelistNum = 0;

      let initiatorNum: number | null = options.getNumber('initiator');
      if (!initiatorNum) initiatorNum = 0;

      let controllerNum: number | null = options.getNumber('controller');
      if (!controllerNum) controllerNum = 0;

      let sentinelNum: number | null = options.getNumber('sentinel');
      if (!sentinelNum) sentinelNum = 0;

      // 各クラスの合計が5人でない場合はエラーを返却
      if (duelistNum + initiatorNum + controllerNum + sentinelNum !== 5) {
        await interaction.editReply('各クラスの合計人数が5人になるようにしてください');
        return;
      }

      // 構成を格納するオブジェクト
      const composition: CompositionData = {
        duelist: [],
        initiator: [],
        controller: [],
        sentinel: [],
      };

      // 各クラスのエージェントを指定された人数分ランダムに選択 (重複なし)
      if (duelistNum) selectAgentsByRole('duelist', duelistNum, composition);
      if (initiatorNum) selectAgentsByRole('initiator', initiatorNum, composition);
      if (controllerNum) selectAgentsByRole('controller', controllerNum, composition);
      if (sentinelNum) selectAgentsByRole('sentinel', sentinelNum, composition);

      console.log(composition);

      // 画像を作成
      await createCompositionImage(composition);

      // メッセージを作成
      const embedMessage = compositionMessage(composition);

      // 構成を表示
      await interaction.editReply(embedMessage);
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
