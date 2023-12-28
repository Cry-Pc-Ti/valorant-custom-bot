import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EmbedBuilder, AttachmentBuilder } from '../modules/discordModule';
import { AgentData, CompositionData } from '../types/valorantAgentData';

export const pickMessage = (agent: AgentData) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Agent')
    .setDescription(`今回のエージェントは${agent.name}です`)
    .setThumbnail(`attachment://${agent.id}_icon.png`)
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_logo.png',
    });

  const thumbnailAttachment = new AttachmentBuilder(`img/agents/${agent.id}_icon.png`);
  const fotterAttachment = new AttachmentBuilder(`img/valorant_logo.png`);

  return { embeds: [embed], files: [thumbnailAttachment, fotterAttachment] };
};

export const compositionMessage = (composition: CompositionData) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Composition')
    .setDescription('今回の構成はこちらです')
    .setImage('attachment://composition.png')
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_logo.png',
    });

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

  const compositionAttachment = new AttachmentBuilder('img/composition.png');
  const fotterAttachment = new AttachmentBuilder(`img/valorant_logo.png`);

  return {
    embeds: [embed],
    files: [compositionAttachment, fotterAttachment],
  };
};
