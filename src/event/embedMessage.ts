import { EmbedBuilder, AttachmentBuilder } from '../modules/discordModule';
import { CompositionData } from '../types/valorantAgentData';

export const compositionMessage = (composition: CompositionData) => {
  const embed = new EmbedBuilder()
    .setTitle('Random Composition')
    .setImage('attachment://composition.png')
    .setColor('#fd4556');

  if (composition.duelist.length) {
    embed.addFields({
      name: 'Duelist',
      value: composition.duelist.map((agent) => agent.name).join(', '),
    });
  }

  if (composition.initiator.length) {
    embed.addFields({
      name: 'Initiator',
      value: composition.initiator.map((agent) => agent.name).join(', '),
    });
  }

  if (composition.controller.length) {
    embed.addFields({
      name: 'Controller',
      value: composition.controller.map((agent) => agent.name).join(', '),
    });
  }

  if (composition.sentinel.length) {
    embed.addFields({
      name: 'Sentinel',
      value: composition.sentinel.map((agent) => agent.name).join(', '),
    });
  }

  const attachment = new AttachmentBuilder('img/composition.png');

  return {
    embeds: [embed],
    files: [attachment],
  };
};
