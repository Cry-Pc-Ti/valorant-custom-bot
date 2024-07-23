import { ButtonInteraction, FetchMemberOptions, FetchMembersOptions, GuildMember, UserResolvable } from 'discord.js';
import { COMMAND_NAME_VALORANT } from '../../commands/valorant/mainValorantCommand';
import { getCommandStates, setPatternIndexStates } from '../../store/guildCommandStates';
import { teamAutoBalanceMessage } from '../../events/discord/valorantEmbedMessage';
import { interactionEditMessages } from '../../events/discord/interactionMessages';

// アタッカーのメンバーを指定されたボイスチャンネルに移動
export const moveAttackersToChannel = async (interaction: ButtonInteraction) => {
  // ボタンを押下したメンバーを取得
  const member = interaction.member as GuildMember;
  // その人がVCにいない場合は制御しない
  if (!member.voice.channel) {
    return await interaction.editReply(`${member.displayName}さんボイスチャットに参加してください `);
  }

  // ギルドIDを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const commandStates = getCommandStates(guildId, COMMAND_NAME_VALORANT);
  const valorantCommandInfo = commandStates?.valorantCommandInfo;

  if (!commandStates || !valorantCommandInfo) return;

  const targetVoiceChannel = await interaction.guild?.channels.fetch(valorantCommandInfo.attackerChannelId);

  if (targetVoiceChannel && targetVoiceChannel.isVoiceBased()) {
    // 各メンバーのボイスチャンネル移動を並列処理で実行
    const movePromises = valorantCommandInfo.teamPattern[valorantCommandInfo.patternIndex].teams.attack.map(
      async (member: {
        id: UserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: UserResolvable });
      }) => {
        const targetMember = await interaction.guild?.members.fetch(member.id);
        if (targetMember?.voice) {
          await targetMember.voice.setChannel(targetVoiceChannel);
        }
      }
    );

    // すべての移動処理が完了するまで待機
    await Promise.all(movePromises);
  }
  interaction.editReply(`${member.displayName}さんがボタンを押しました。 `);
};

// ディフェンダーのメンバーを指定されたボイスチャンネルに移動
export const moveDefendersToChannel = async (interaction: ButtonInteraction) => {
  // ボタンを押下したメンバーを取得
  const member = interaction.member as GuildMember;
  // その人がVCにいない場合は制御しない
  if (!member.voice.channel) {
    return await interaction.editReply(`${member.displayName}さんボイスチャットに参加してください `);
  }

  //ギルドIDを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const commandStates = getCommandStates(guildId, COMMAND_NAME_VALORANT);
  const valorantCommandInfo = commandStates?.valorantCommandInfo;

  if (!commandStates || !valorantCommandInfo) return;

  const targetVoiceChannel = await interaction.guild?.channels.fetch(valorantCommandInfo.defenderChannelId);

  if (targetVoiceChannel && targetVoiceChannel.isVoiceBased()) {
    // 各メンバーのボイスチャンネル移動を並列処理で実行
    const movePromises = valorantCommandInfo.teamPattern[valorantCommandInfo.patternIndex].teams.defense.map(
      async (member: {
        id: UserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: UserResolvable });
      }) => {
        const targetMember = await interaction.guild?.members.fetch(member.id);
        if (targetMember?.voice) {
          await targetMember.voice.setChannel(targetVoiceChannel);
        }
      }
    );

    // すべての移動処理が完了するまで待機
    await Promise.all(movePromises);
  }
  interaction.editReply(`${member.displayName}さんがボタンを押しました。 `);
};
// 次のパターンを表示する
export const nextPatternMessage = async (interaction: ButtonInteraction) => {
  // ボタンを押下したメンバーを取得
  const member = interaction.member as GuildMember;
  // その人がVCにいない場合は制御しない
  if (!member.voice.channel) {
    return await interaction.editReply(`${member.displayName}さんボイスチャットに参加してください `);
  }

  //ギルドIDを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const commandStates = getCommandStates(guildId, COMMAND_NAME_VALORANT);
  const valorantCommandInfo = commandStates?.valorantCommandInfo;

  if (!commandStates || !valorantCommandInfo) return;

  let nowPatternIndex = valorantCommandInfo.patternIndex + 1;
  if (nowPatternIndex < valorantCommandInfo.teamPattern.length) {
    setPatternIndexStates(guildId, COMMAND_NAME_VALORANT, nowPatternIndex);
  } else {
    nowPatternIndex = 0;
    setPatternIndexStates(guildId, COMMAND_NAME_VALORANT, nowPatternIndex);
  }

  // メッセージを作成
  const embed = teamAutoBalanceMessage(
    valorantCommandInfo.teamPattern,
    commandStates.buttonRowArray[0],
    valorantCommandInfo.attackerChannelId,
    valorantCommandInfo.defenderChannelId,
    guildId,
    nowPatternIndex
  );

  // メッセージを送信
  await interactionEditMessages(interaction, commandStates.replyMessageId, embed);
};
