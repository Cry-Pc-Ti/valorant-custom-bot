import {
  ActionRowBuilder,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { AgentData, CompositionData } from '../../../types/valorantData';
import { selectAgentsByRole } from '../../../events/valorant/selectAgentsByRole';
import { createConcatImage } from '../../../events/common/createConcatImage';
import { compositionMessage } from '../../../events/discord/valorantEmbedMessage';
import { countAgentsByRole, countBanAgentsByRole } from '../../../events/valorant/countAgentsNum';
import { Logger } from '../../../events/common/log';
import { fetchAgentsData } from '../../../service/valorant.service';

export const compositionCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const { options, user } = interaction;

    // 各ロールの人数を取得
    let duelistNum: number = options.getNumber('duelist') ?? 0;
    let initiatorNum: number = options.getNumber('initiator') ?? 0;
    let controllerNum: number = options.getNumber('controller') ?? 0;
    let sentinelNum: number = options.getNumber('sentinel') ?? 0;

    // BAN機能の有無を取得
    const isBan: boolean = options.getString('ban') === 'true';

    // valorant-apiからエージェント情報を取得
    const agents: AgentData[] = await fetchAgentsData();

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

    //* BAN機能が無効の場合
    if (!isBan) {
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
      if (duelistNum) selectAgentsByRole('duelist', duelistNum, composition, agents);
      if (initiatorNum) selectAgentsByRole('initiator', initiatorNum, composition, agents);
      if (controllerNum) selectAgentsByRole('controller', controllerNum, composition, agents);
      if (sentinelNum) selectAgentsByRole('sentinel', sentinelNum, composition, agents);

      // すべての値が空の場合はエラーを返却
      if (Object.values(composition).every((role) => role.length === 0)) {
        await interaction.editReply('構成作成中にエラーが発生しました。再度コマンドを入力してください。');
        return;
      }

      // 連結したい画像のファイルパス
      const imagePaths: string[] = [];

      // 画像のパスを配列に格納
      for (const agentRole in composition) {
        if (agentRole !== 'ban') {
          for (const agent of composition[agentRole as keyof CompositionData]) {
            imagePaths.push(`https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png`);
          }
        }
      }

      // 画像を作成
      await createConcatImage(imagePaths, user.id);

      // メッセージを作成
      const embedMessage: {
        embeds: EmbedBuilder[];
        files: AttachmentBuilder[];
      } = compositionMessage(composition, banAgents, user.id);

      // メッセージを送信
      await interaction.editReply(embedMessage);

      //* BAN機能が有効の場合
    } else {
      // セレクトメニューを作成
      const banSelectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
        .setCustomId('banAgent')
        .setPlaceholder('BANするエージェントを選択してください')
        .setMinValues(0)
        .setMaxValues(agents.length - 5)
        .addOptions(
          agents.map((agent) => ({
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
      // 5分後にセレクトメニューを削除するタイマーをセット
      const timeoutId = setTimeout(
        async () => {
          await selectResponse.edit({
            content: '選択されませんでした。再度コマンドを入力してください',
            components: [],
          });
        },
        5 * 60 * 1000
      );

      // セレクトメニューで選択された値を取得
      const collector = selectResponse.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (selectMenuInteraction) => selectMenuInteraction.user.id === user.id,
      });

      collector.on('collect', async (selectMenuInteraction: StringSelectMenuInteraction) => {
        try {
          // タイマーを削除
          clearTimeout(timeoutId);

          // BANされたエージェントを取得
          const banAgentIds: string[] = selectMenuInteraction.values;

          // BANされたエージェントをcompositionに格納
          banAgents = agents.filter((agent) => banAgentIds.includes(agent.id));

          // ValorantAgentsからBAN対象とされたエージェントを排除
          const filteredValorantAgents = agents.filter((agent) => !banAgentIds.includes(agent.id));

          // ValorantAgentsのroleから各ロールの人数を取得
          const allDuelistNum = countAgentsByRole(agents, 'duelist');
          const allInitiatorNum = countAgentsByRole(agents, 'initiator');
          const allControllerNum = countAgentsByRole(agents, 'controller');
          const allSentinelNum = countAgentsByRole(agents, 'sentinel');

          // BANされたエージェントのロールを取得し、各ロールのBANされたエージェントの人数を取得
          const banDuelistNum = countBanAgentsByRole(agents, 'duelist', banAgentIds);
          const banInitiatorNum = countBanAgentsByRole(agents, 'initiator', banAgentIds);
          const banControllerNum = countBanAgentsByRole(agents, 'controller', banAgentIds);
          const banSentinelNum = countBanAgentsByRole(agents, 'sentinel', banAgentIds);

          // BANされたエージェントが各ロールの指定可能人数を超えているかどうか
          let isBanError = false;
          let banErrorMessage = '';

          // 各ロールの指定可能人数が超えている場合、エラーを返却
          if (duelistNum > 0 && allDuelistNum - banDuelistNum < duelistNum) {
            banErrorMessage += 'デュエリストのエージェント数が足りません\n';
            isBanError = true;
          }

          if (initiatorNum > 0 && allInitiatorNum - banInitiatorNum < initiatorNum) {
            banErrorMessage += 'イニシエーターのエージェント数が足りません\n';
            isBanError = true;
          }

          if (controllerNum > 0 && allControllerNum - banControllerNum < controllerNum) {
            banErrorMessage += 'コントローラーのエージェント数が足りません\n';
            isBanError = true;
          }

          if (sentinelNum > 0 && allSentinelNum - banSentinelNum < sentinelNum) {
            banErrorMessage += 'センチネルのエージェント数が足りません\n';
            isBanError = true;
          }

          if (isBanError) {
            await interaction.editReply({
              content: `${banErrorMessage}もう一度コマンドを実行してください`,
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
                imagePaths.push(`https://media.valorant-api.com/agents/${agent.uuid}/displayicon.png`);
              }
            }
          }

          // 画像を作成
          await createConcatImage(imagePaths, user.id);

          // メッセージを作成・送信
          const embed = compositionMessage(composition, banAgents, user.id);
          await interaction.editReply(embed);
        } catch (error) {
          Logger.LogError(
            `【${interaction.guild?.id}】compositionCommandMainEventt・selectMenuInteractionでエラーが発生しました`,
            error
          );
          await interaction.editReply('処理中にエラーが発生しました。\n再度コマンドを入力してください。');
        }
      });
    }
  } catch (error) {
    Logger.LogError(`【${interaction.guild?.id}】compositionCommandMainEventでエラーが発生しました`, error);
    await interaction.editReply({
      content: '処理中にエラーが発生しました。\n再度コマンドを入力してください。',
      components: [],
    });
  }
};
