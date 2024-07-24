import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Logger } from '../../../events/common/log';
import { setGuildCommandStates } from '../../../store/guildCommandStates';
import { v4 as uuidv4 } from 'uuid';
import { COMMAND_NAME_VALORANT } from '../mainValorantCommand';
import { interactionEditMessages } from '../../../events/discord/interactionMessages';
import {
  generateAutoBalanceTeamsPatterns,
  generateRandomTeamPatterns,
} from '../../../events/valorant/generateRandomTeamPatterns';
import { teamAutoBalanceMessage, teamMessage } from '../../../events/discord/valorantEmbedMessage';

export const teamCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const { options, guildId, guild } = interaction;
    if (!options || !guildId || !guild) return;

    // コマンドで指定されたチャンネルIDを取得
    const attackerChannelId = options.getChannel('attacker')?.id;
    const defenderChannelId = options.getChannel('defender')?.id;

    // autoBalance機能の有無を取得
    const autoBalanceMode: boolean = options.getString('auto-balance') === 'true';

    // チャンネルIDが取得できない場合はエラーを返す
    if (!attackerChannelId || !defenderChannelId) {
      return await interaction.editReply('ボイスチャンネルが取得できませんでした');
    }

    // チャンネルを取得
    const attackerChannel = await interaction.guild?.channels.fetch(attackerChannelId);
    const defenderChannel = await interaction.guild?.channels.fetch(defenderChannelId);

    // チャンネルが取得できない場合はエラーを返す
    if (!attackerChannel || !defenderChannel) {
      return await interaction.editReply('ボイスチャンネルが取得できませんでした');
    }

    // コマンドを発火したメンバーが参加しているVCを取得
    const targetMember = await interaction.guild?.members.fetch(interaction.user.id);
    const membersInVC = targetMember?.voice.channel?.members.map((member) => member.user);

    // メンバーがいない場合は処理を終了
    if (!membersInVC) return interaction.editReply('VCに参加してください');

    // ボタンを作成
    const uniqueId = uuidv4();

    const attackerVCButton = new ButtonBuilder()
      .setCustomId(`attacker_${uniqueId}`)
      .setLabel('Attacker VC')
      .setStyle(ButtonStyle.Danger);

    const difenderVCButton = new ButtonBuilder()
      .setCustomId(`difender_${uniqueId}`)
      .setLabel('Defender VC')
      .setStyle(ButtonStyle.Primary);

    const nextPatternButton = new ButtonBuilder()
      .setCustomId(`nextPattern_${uniqueId}`)
      .setLabel('次の組み合わせ')
      .setStyle(ButtonStyle.Success);

    // ボタンをActionRowに追加
    const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
      attackerVCButton,
      difenderVCButton,
      nextPatternButton
    );

    const buttonCollector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    if (!buttonCollector) return;

    // セレクトメニューを作成
    const memberSelectMenu: StringSelectMenuBuilder = new StringSelectMenuBuilder()
      .setCustomId('member')
      .setPlaceholder('参加するユーザを選択してください')
      .setMinValues(1)
      .setMaxValues(membersInVC.length >= 10 ? 10 : membersInVC.length)
      .addOptions(
        membersInVC.map((member) => ({
          label: member.displayName,
          value: member.id,
        }))
      );

    // セレクトメニューを送信
    const row: ActionRowBuilder<StringSelectMenuBuilder> =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(memberSelectMenu);

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
    const selectMenuCollector = selectResponse.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (selectMenuInteraction) => selectMenuInteraction.user.id === interaction.user.id,
    });

    selectMenuCollector.on('collect', async (selectMenuInteraction: StringSelectMenuInteraction) => {
      selectMenuInteraction.deferUpdate();

      // タイマーを削除
      clearTimeout(timeoutId);

      // メンバーIDを取得
      const memberIds = selectMenuInteraction.values;

      const replyMessageId = (await interaction.fetchReply()).id;

      if (autoBalanceMode) {
        // メンバーIDからDBにランク情報を取得
        const teamPatterns = await generateAutoBalanceTeamsPatterns(memberIds);

        // ストアに情報をセット
        setGuildCommandStates(guildId, COMMAND_NAME_VALORANT, {
          buttonCollector: buttonCollector,
          buttonRowArray: [buttonRow],
          uniqueId: uniqueId,
          interaction: interaction,
          replyMessageId: replyMessageId,
          valorantCommandInfo: {
            attackerChannelId: attackerChannelId,
            defenderChannelId: defenderChannelId,
            teamPattern: teamPatterns,
            patternIndex: 0,
          },
        });

        // メッセージを作成
        const embed = teamAutoBalanceMessage(teamPatterns, buttonRow, attackerChannelId, defenderChannelId, guildId, 0);

        // メッセージを送信
        return await interactionEditMessages(interaction, replyMessageId, embed);

        // チーム分け用のオブジェクトを作成
      } else {
        // メンバーIDからDBにランク情報を取得
        const teamPatterns = await generateRandomTeamPatterns(memberIds);

        // ストアに情報をセット
        setGuildCommandStates(guildId, COMMAND_NAME_VALORANT, {
          buttonCollector: buttonCollector,
          buttonRowArray: [buttonRow],
          uniqueId: uniqueId,
          interaction: interaction,
          replyMessageId: replyMessageId,
          valorantCommandInfo: {
            attackerChannelId: attackerChannelId,
            defenderChannelId: defenderChannelId,
            teamPattern: teamPatterns,
            patternIndex: 0,
          },
        });

        // メッセージを作成
        const embed = teamMessage(teamPatterns, buttonRow, attackerChannelId, defenderChannelId, guildId, 0);

        // メッセージを送信
        await interactionEditMessages(interaction, replyMessageId, embed);
        return;
      }
    });
    selectMenuCollector.on('end', () => {
      selectMenuCollector.stop();
    });
  } catch (error) {
    Logger.LogError(`【${interaction.guild?.id}】teamCommandMainEventでエラーが発生しました`, error);
    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
