import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { TeamData, MemberData } from '../../../types/memberData';
import { generateRandomNum } from '../../../events/common/generateRandomNum';
import { teamMessage } from '../../../events/discord/embedMessage';
import { Logger } from '../../../events/common/log';
import { setGuildCommandStates } from '../../../store/guildCommandStates';
import { v4 as uuidv4 } from 'uuid';
import { COMMAND_NAME_VALORANT } from '../mainValorantCommand';

export const teamCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  try {
    const { options, guildId, guild } = interaction;
    if (!options || !guildId || !guild) return;

    // コマンドで指定されたチャンネルIDを取得
    const attackerChannelId = options.getChannel('attacker')?.id;
    const defenderChannelId = options.getChannel('defender')?.id;

    // チャンネルIDが取得できない場合はエラーを返す
    if (!attackerChannelId || !defenderChannelId) {
      await interaction.editReply('ボイスチャンネルが取得できませんでした');
      return;
    }

    // チャンネルを取得
    const attackerChannel = await interaction.guild?.channels.fetch(attackerChannelId);
    const defenderChannel = await interaction.guild?.channels.fetch(defenderChannelId);

    // チャンネルが取得できない場合はエラーを返す
    if (!attackerChannel || !defenderChannel) {
      await interaction.editReply('ボイスチャンネルが取得できませんでした');
      return;
    }

    // コマンドを発火したメンバーが参加しているVCを取得
    const targetMember = await interaction.guild?.members.fetch(interaction.user.id);
    const membersInVC = targetMember?.voice.channel?.members.map((member) => member.user);

    // メンバーがいない場合は処理を終了
    if (!membersInVC) return interaction.editReply('VCに参加してください');

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

    // セレクトメニューで選択された値を取得
    const selectMenuCollector = selectResponse.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (selectMenuInteraction) => selectMenuInteraction.user.id === interaction.user.id,
    });

    selectMenuCollector.on('collect', async (selectMenuInteraction: StringSelectMenuInteraction) => {
      // メンバーIDを取得
      const memberIds = selectMenuInteraction.values;

      //メンバー情報を作成
      const memberData: MemberData[] = [];

      for (const userId of memberIds) {
        // ユーザIDからユーザ情報を取得
        const user = await guild.members.fetch(userId);

        // ユーザがいない場合はスキップ
        if (!user) continue;

        // メンバー情報を配列に追加
        memberData.push({
          name: user?.user.displayName,
          id: user?.user.id,
          avatarImg: user?.user.avatarURL(),
        });
      }

      // チーム分け用のオブジェクトを作成
      const teams: TeamData = {
        attack: [],
        defense: [],
      };

      // メンバーを振り分け
      // メンバー数が奇数の場合は、攻撃側が1人多くなるように振り分け
      const totalMembers = memberData.length;
      const maxAttackMembers = Math.ceil(totalMembers / 2);
      const maxDefenseMembers = Math.floor(totalMembers / 2);

      let attackCount = 0;
      let defenseCount = 0;

      for (const member of memberData) {
        const randomNumber = generateRandomNum(0, 1);

        if (randomNumber === 0 && attackCount < maxAttackMembers) {
          teams.attack.push(member);
          attackCount++;
        } else if (defenseCount < maxDefenseMembers) {
          teams.defense.push(member);
          defenseCount++;
        } else {
          teams.attack.push(member);
          attackCount++;
        }
      }

      // メッセージを作成
      const embed = teamMessage(teams, attackerChannelId, defenderChannelId, guildId);

      // メッセージを送信
      await interaction.editReply(embed);

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

      // ボタンをActionRowに追加
      const buttonRow: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>().addComponents(
        attackerVCButton,
        difenderVCButton
      );

      const buttonCollector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      if (!buttonCollector) return;

      setGuildCommandStates(guildId, COMMAND_NAME_VALORANT, {
        buttonCollector: buttonCollector,
        buttonRowArray: [buttonRow],
        uniqueId: uniqueId,
        interaction: interaction,
        replyMessageId: (await interaction.fetchReply()).id,
        valorantCommandInfo: {
          attackerChannelId: attackerChannelId,
          defenderChannelId: defenderChannelId,
          teams: teams,
        },
      });

      // ボタンを送信
      await interaction.followUp({ components: [buttonRow], ephemeral: true });

      buttonCollector.on('end', () => {
        buttonCollector.stop();
      });
    });
  } catch (error) {
    Logger.LogSystemError(`teamCommandMainEventでエラーが発生しました : ${error}`);
    await interaction.editReply('処理中にエラーが発生しました。再度コマンドを入力してください。');
  }
};
