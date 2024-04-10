import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { memberAllocationMessage } from '../../events/embedMessage';
import { generateRandomNum as generateRandomNum } from '../../events/generateRandomNum';
import { MemberAllocationData, MemberData } from '../../types/memberData';
import { mainVoiceChannelId, subVoiceChannelId } from '../../modules/discordModule';

// チーム割り当てコマンド
export const memberAllocationCommand = {
  // コマンドの設定
  data: new SlashCommandBuilder().setName('member').setDescription('メンバーをランダムでチーム分けします').toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    try {
      // コマンドを発火したメンバーが参加しているVCを取得
      const targetMember = await interaction.guild?.members.fetch(interaction.user.id);
      const membersInVC = targetMember?.voice.channel?.members.map((member) => member.user);

      // メンバーがいない場合は処理を終了
      if (!membersInVC) {
        interaction.editReply('VCに参加してください');

        // メンバーがいる場合は処理を続行
      } else {
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
            const user = await interaction.guild?.members.fetch(userId);

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
          const teamAllocation: MemberAllocationData = {
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
            const randomNumber = await generateRandomNum(0, 1);

            if (randomNumber === 0 && attackCount < maxAttackMembers) {
              teamAllocation.attack.push(member);
              attackCount++;
            } else if (defenseCount < maxDefenseMembers) {
              teamAllocation.defense.push(member);
              defenseCount++;
            } else {
              teamAllocation.attack.push(member);
              attackCount++;
            }
          }

          // メッセージを作成・送信
          const message = memberAllocationMessage(teamAllocation);

          await interaction.editReply({
            embeds: [message.embeds],
            files: [message.fotterAttachment],
            components: [],
          });

          // ボタンを作成
          const uniqueId = Date.now();
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

          // ボタンを送信
          await interaction.followUp({ components: [buttonRow], ephemeral: true });

          const buttonCollector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
          });

          if (!buttonCollector) return;

          // ボタンが押された時の処理
          buttonCollector.on('collect', async (buttonInteraction: ButtonInteraction) => {
            try {
              if (!buttonInteraction.replied && !buttonInteraction.deferred) {
                await buttonInteraction.deferUpdate();
              }

              // アタッカーのメンバーをメインのボイスチャンネルに移動
              if (buttonInteraction.customId === `attacker_${uniqueId}`) {
                const targetVoiceChannel = await interaction.guild?.channels.fetch(mainVoiceChannelId);

                if (targetVoiceChannel) {
                  if (targetVoiceChannel.isVoiceBased()) {
                    for (const member of teamAllocation.attack) {
                      const targetMember = await interaction.guild?.members.fetch(member.id);
                      await targetMember?.voice.setChannel(targetVoiceChannel);
                    }
                  }
                }
              }

              // ディフェンダーのメンバーをサブのボイスチャンネルに移動
              if (buttonInteraction.customId === `difender_${uniqueId}`) {
                const targetVoiceChannel = await interaction.guild?.channels.fetch(subVoiceChannelId);

                if (targetVoiceChannel) {
                  if (targetVoiceChannel.isVoiceBased()) {
                    for (const member of teamAllocation.defense) {
                      const targetMember = await interaction.guild?.members.fetch(member.id);
                      await targetMember?.voice.setChannel(targetVoiceChannel);
                    }
                  }
                }
              }
            } catch (error) {
              console.error(error);
              await interaction.followUp({ content: 'ボタンの処理中にエラーが発生しました', ephemeral: true });
            }
          });
        });
      }
    } catch (error) {
      await interaction.editReply('処理中にエラーが発生しました');
      console.error(error);
    }
  },
};
