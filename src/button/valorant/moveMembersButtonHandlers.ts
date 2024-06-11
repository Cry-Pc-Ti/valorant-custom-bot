import { ButtonInteraction } from 'discord.js';
import { COMMAND_NAME_VALORANT } from '../../commands/valorant/mainValorantCommand';
import { getCommandStates } from '../../store/guildCommandStates';

// アタッカーのメンバーを指定されたボイスチャンネルに移動
export const moveAttackersToChannel = async (interaction: ButtonInteraction) => {
  //ギルドIDを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const commandStates = getCommandStates(guildId, COMMAND_NAME_VALORANT);
  const valorantCommandInfo = commandStates?.valorantCommandInfo;

  if (!commandStates || !valorantCommandInfo) return;

  const targetVoiceChannel = await interaction.guild?.channels.fetch(valorantCommandInfo.attackerChannelId);

  if (targetVoiceChannel) {
    if (targetVoiceChannel.isVoiceBased()) {
      for (const member of valorantCommandInfo.teams.attack) {
        const targetMember = await interaction.guild?.members.fetch(member.id);
        await targetMember?.voice.setChannel(targetVoiceChannel);
      }
    }
  }
};

// ディフェンダーのメンバーを指定されたボイスチャンネルに移動
export const moveDefendersToChannel = async (interaction: ButtonInteraction) => {
  //ギルドIDを取得
  const guildId = interaction.guildId;
  if (!guildId) return;

  const commandStates = getCommandStates(guildId, COMMAND_NAME_VALORANT);
  const valorantCommandInfo = commandStates?.valorantCommandInfo;

  if (!commandStates || !valorantCommandInfo) return;

  const targetVoiceChannel = await interaction.guild?.channels.fetch(valorantCommandInfo.defenderChannelId);

  if (targetVoiceChannel) {
    if (targetVoiceChannel.isVoiceBased()) {
      for (const member of valorantCommandInfo.teams.defense) {
        const targetMember = await interaction.guild?.members.fetch(member.id);
        await targetMember?.voice.setChannel(targetVoiceChannel);
      }
    }
  }
};
