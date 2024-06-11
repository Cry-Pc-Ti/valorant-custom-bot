import { ButtonInteraction, FetchMemberOptions, FetchMembersOptions, UserResolvable } from 'discord.js';
import { COMMAND_NAME_VALORANT } from '../../commands/valorant/mainValorantCommand';
import { getCommandStates } from '../../store/guildCommandStates';

// アタッカーのメンバーを指定されたボイスチャンネルに移動
export const moveAttackersToChannel = async (interaction: ButtonInteraction) => {
  // ギルドIDを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const commandStates = getCommandStates(guildId, COMMAND_NAME_VALORANT);
  const valorantCommandInfo = commandStates?.valorantCommandInfo;

  if (!commandStates || !valorantCommandInfo) return;

  const targetVoiceChannel = await interaction.guild?.channels.fetch(valorantCommandInfo.attackerChannelId);

  if (targetVoiceChannel && targetVoiceChannel.isVoiceBased()) {
    // 各メンバーのボイスチャンネル移動を並列処理で実行
    const movePromises = valorantCommandInfo.teams.attack.map(
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
};

// ディフェンダーのメンバーを指定されたボイスチャンネルに移動
export const moveDefendersToChannel = async (interaction: ButtonInteraction) => {
  //ギルドIDを取得
  // ギルドIDを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const commandStates = getCommandStates(guildId, COMMAND_NAME_VALORANT);
  const valorantCommandInfo = commandStates?.valorantCommandInfo;

  if (!commandStates || !valorantCommandInfo) return;

  const targetVoiceChannel = await interaction.guild?.channels.fetch(valorantCommandInfo.defenderChannelId);

  if (targetVoiceChannel && targetVoiceChannel.isVoiceBased()) {
    // 各メンバーのボイスチャンネル移動を並列処理で実行
    const movePromises = valorantCommandInfo.teams.defense.map(
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
};
