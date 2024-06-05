import { AudioPlayer } from '@discordjs/voice';
import { ButtonInteraction, CacheType, ChatInputCommandInteraction, InteractionCollector } from 'discord.js';
import { terminateMidwayInteractionEditMessages } from '../events/discord/interactionMessages';

interface CollectorInfo {
  player: AudioPlayer;
  buttonCollector: InteractionCollector<ButtonInteraction<CacheType>>;
  interaction: ChatInputCommandInteraction;
  replyMessageId: string;
}

export const guildStates = new Map<string, CollectorInfo>();

export const stopPreviousInteraction = async (guildId: string) => {
  const state = guildStates.get(guildId);
  if (state) {
    await terminateMidwayInteractionEditMessages(state.interaction, state.replyMessageId);
    state.player.stop();
    state.player.removeAllListeners();
    state.buttonCollector.stop();
    guildStates.delete(guildId);
  }
};
