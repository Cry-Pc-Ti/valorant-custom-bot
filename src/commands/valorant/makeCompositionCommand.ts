// モジュールをインポート
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType,
  StringSelectMenuInteraction,
} from 'discord.js';
import { selectAgentsByRole } from '../../events/selectAgentsByRole';
import { countAgentsByRole, countBanAgentsByRole } from '../../events/countAgentsNum';
import { createImage } from '../../events/createConcatImage';
import { compositionMessage } from '../../events/embedMessage';
import { AgentData, CompositionData } from '../../types/valorantData';
import { valorantAgents } from '../../events/readJsonData';

// 構成作成コマンド
export const makeCompositionCommand = {
  data: new SlashCommandBuilder()
    .setName('composition')
    .setDescription('ランダムに構成を作成します')
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
    .addBooleanOption((option) => option.setName('ban').setDescription('BANエージェントを選択するか指定してください'))
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      const { options } = interaction;

      // 各ロールの人数を取得
      let duelistNum: number = options.getNumber('duelist') ?? 0;
      let initiatorNum: number = options.getNumber('initiator') ?? 0;
      let controllerNum: number = options.getNumber('controller') ?? 0;
      let sentinelNum: number = options.getNumber('sentinel') ?? 0;

      // BAN機能の有無を取得
      const ban: boolean = options.getBoolean('ban') ?? false;

      // 構成を格納するオブジェクトを宣言
      const composition: CompositionData = {
        duelist: [],
        initiator: [],
        controller: [],
        sentinel: [],
      };

      // BANされたエージェントを格納する配列を宣言
      let banAgents: AgentData[] = [];

      // 各クラスの合計が5人以上の場合、エラーを返却
      if (duelistNum + initiatorNum + controllerNum + sentinelNum > 5) {
        await interaction.editReply('各クラスの合計人数が5人以下になるように設定してください');
        return;
      }

      // BAN機能が無効の場合
      if (!ban) {
        // 指定人数が5人未満の場合、不足分のロールをランダムに選択
        if (duelistNum + initiatorNum + controllerNum + sentinelNum < 5) {
          const total = 5;

          // 不足分を計算
          const shortage = total - duelistNum - initiatorNum - controllerNum - sentinelNum;

          // 不足分をランダムに選択
          if (shortage > 0) {
            // 不足分の数だけ0~3のランダムな数字を生成
            const shortageArray = Array.from({ length: shortage }, () => Math.floor(Math.random() * 4));

            shortageArray.forEach((role) => {
              if (role === 0) duelistNum += 1;
              if (role === 1) initiatorNum += 1;
              if (role === 2) controllerNum += 1;
              if (role === 3) sentinelNum += 1;
            });
          }
        }

        // 各クラスのエージェントを指定された人数分ランダムに選択
        if (duelistNum) selectAgentsByRole('duelist', duelistNum, composition, valorantAgents);
        if (initiatorNum) selectAgentsByRole('initiator', initiatorNum, composition, valorantAgents);
        if (controllerNum) selectAgentsByRole('controller', controllerNum, composition, valorantAgents);
        if (sentinelNum) selectAgentsByRole('sentinel', sentinelNum, composition, valorantAgents);

        // すべての値が空の場合はエラーを返却
        if (Object.values(composition).every((role) => role.length === 0)) {
          await interaction.editReply('構成作成中にエラーが発生しました\n開発者にお問い合わせください');
          return;
        }

        // 連結したい画像のファイルパス
        const imagePaths: string[] = [];

        // 画像のパスを配列に格納
        for (const agentRole in composition) {
          if (agentRole !== 'ban') {
            for (const agent of composition[agentRole as keyof CompositionData]) {
              imagePaths.push(`static/img/valorant_agents/${agent.id}_icon.png`);
            }
          }
        }
        // 画像を作成
        await createImage(imagePaths);

        // メッセージを作成
        const embedMessage: {
          embeds: EmbedBuilder[];
          files: AttachmentBuilder[];
        } = compositionMessage(composition, banAgents);

        // メッセージを送信
        await interaction.editReply(embedMessage);

        // BAN機能が有効の場合、SelectMenuでBAN対象のエージェントを選択
      } else {
        // セレクトメニューを作成
        const banSelectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
          .setCustomId('banAgent')
          .setPlaceholder('BANするエージェントを選択してください')
          .setMinValues(0)
          .setMaxValues(valorantAgents.length - 5)
          .addOptions(
            valorantAgents.map((agent) => ({
              label: agent.name,
              value: agent.id,
            }))
          );

        // セレクトメニューを送信
        const row: ActionRowBuilder<StringSelectMenuBuilder> =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(banSelectMenu);

        const selectResponse = await interaction.editReply({
          components: [row],
        });

        // セレクトメニューで選択された値を取得
        const collector = selectResponse.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (selectMenuInteraction) => selectMenuInteraction.user.id === interaction.user.id,
        });

        collector.on('collect', async (selectMenuInteraction: StringSelectMenuInteraction) => {
          // BANされたエージェントを取得
          const banAgentIds: string[] = selectMenuInteraction.values;

          // BANされたエージェントをcompositionに格納
          banAgents = valorantAgents.filter((agent) => banAgentIds.includes(agent.id));

          // ValorantAgentsからBAN対象とされたエージェントを排除
          const filteredValorantAgents = valorantAgents.filter((agent) => !banAgentIds.includes(agent.id));

          // ValorantAgentsのroleから各ロールの人数を取得
          const allDuelistNum = countAgentsByRole('duelist');
          const allInitiatorNum = countAgentsByRole('initiator');
          const allControllerNum = countAgentsByRole('controller');
          const allSentinelNum = countAgentsByRole('sentinel');

          // BANされたエージェントのロールを取得し、各ロールのBANされたエージェントの人数を取得
          const banDuelistNum = countBanAgentsByRole('duelist', banAgentIds);
          const banInitiatorNum = countBanAgentsByRole('initiator', banAgentIds);
          const banControllerNum = countBanAgentsByRole('controller', banAgentIds);
          const banSentinelNum = countBanAgentsByRole('sentinel', banAgentIds);

          // 各ロールの指定可能人数が超えている場合、エラーを返却
          if (duelistNum > 0 && allDuelistNum - banDuelistNum < duelistNum) {
            await interaction.editReply({
              content: '指定されたデュエリストの人数が選択可能な最大人数を超えています',
              components: [],
            });
            return;
          }

          if (initiatorNum > 0 && allInitiatorNum - banInitiatorNum < initiatorNum) {
            await interaction.editReply({
              content: '指定されたイニシエーターの人数が選択可能な最大人数を超えています',
              components: [],
            });
            return;
          }

          if (controllerNum > 0 && allControllerNum - banControllerNum < controllerNum) {
            await interaction.editReply({
              content: '指定されたコントローラーの人数が選択可能な最大人数を超えています',
              components: [],
            });
            return;
          }

          if (sentinelNum > 0 && allSentinelNum - banSentinelNum < sentinelNum) {
            await interaction.editReply({
              content: '指定されたセンチネルの人数が選択可能な最大人数を超えています',
              components: [],
            });
            return;
          }

          // 指定人数が5人未満の場合、不足分のロールをランダムに選択
          if (duelistNum + initiatorNum + controllerNum + sentinelNum < 5) {
            const total = 5;

            // 不足分を計算
            let shortage = total - duelistNum - initiatorNum - controllerNum - sentinelNum;

            // 不足分をランダムに選択
            while (shortage > 0) {
              // 0~3のランダムな数字を生成
              const roleNum = Math.floor(Math.random() * 4);

              if (roleNum === 0 && duelistNum < allDuelistNum - banDuelistNum) {
                duelistNum += 1;
                shortage -= 1;
              }

              if (roleNum === 1 && initiatorNum < allInitiatorNum - banInitiatorNum) {
                initiatorNum += 1;
                shortage -= 1;
              }

              if (roleNum === 2 && controllerNum < allControllerNum - banControllerNum) {
                controllerNum += 1;
                shortage -= 1;
              }

              if (roleNum === 3 && sentinelNum < allSentinelNum - banSentinelNum) {
                sentinelNum += 1;
                shortage -= 1;
              }
            }
          }

          // 各クラスのエージェントを指定された人数分ランダムに選択
          if (duelistNum) selectAgentsByRole('duelist', duelistNum, composition, filteredValorantAgents);
          if (initiatorNum) selectAgentsByRole('initiator', initiatorNum, composition, filteredValorantAgents);
          if (controllerNum) selectAgentsByRole('controller', controllerNum, composition, filteredValorantAgents);
          if (sentinelNum) selectAgentsByRole('sentinel', sentinelNum, composition, filteredValorantAgents);

          // すべての値が空の場合はエラーを返却
          if (Object.values(composition).every((role) => role.length === 0)) {
            await interaction.editReply('構成作成中にエラーが発生しました\n開発者にお問い合わせください');
            return;
          }

          // 連結したい画像のファイルパス
          const imagePaths: string[] = [];

          // 画像のパスを配列に格納
          for (const agentRole in composition) {
            if (agentRole !== 'ban') {
              for (const agent of composition[agentRole as keyof CompositionData]) {
                imagePaths.push(`static/img/valorant_agents/${agent.id}_icon.png`);
              }
            }
          }
          // 画像を作成
          await createImage(imagePaths);

          // メッセージを作成・送信
          const embed = compositionMessage(composition, banAgents);
          await interaction.editReply(embed);
        });
      }
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました\n開発者にお問い合わせください');
      console.error(`makeCompositionCommandでエラーが発生しました : ${error}`);
    }
  },
};
