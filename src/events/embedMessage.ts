import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EmbedBuilder, AttachmentBuilder } from '../modules/discordModule';
import { AgentData, CompositionData, MapData } from '../types/valorantAgentData';

const agentWebURL = 'https://playvalorant.com/ja-jp/agents/';

export const agentMessage = (agent: AgentData) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Agent')
    .setDescription(`今回のエージェントは[${agent.name}](${agentWebURL}${agent.id})です`)
    .setThumbnail(`attachment://${agent.id}_icon.png`)
    .addFields({
      name: 'Role',
      value: agent.role.charAt(0).toUpperCase() + agent.role.slice(1),
    })
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_logo.png',
    });

  const thumbnailAttachment = new AttachmentBuilder(`img/agents/${agent.id}_icon.png`);
  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

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

  // デュエリストが選択されている場合、フィールドを追加
  if (composition.duelist.length) {
    const duelists: string[] = [];
    for (const agent of composition.duelist) {
      duelists.push(`[${agent.name}](${agentWebURL}${agent.id})`);
    }
    embed.addFields({
      name: 'Duelist',
      value: duelists.join(', '),
    });
  }

  // イニシエーターが選択されている場合、フィールドを追加
  if (composition.initiator.length) {
    const initiators: string[] = [];
    for (const agent of composition.initiator) {
      initiators.push(`[${agent.name}](${agentWebURL}${agent.id})`);
    }
    embed.addFields({
      name: 'Initiator',
      value: initiators.join(', '),
    });
  }

  // コントローラーが選択されている場合、フィールドを追加
  if (composition.controller.length) {
    const controllers: string[] = [];
    for (const agent of composition.controller) {
      controllers.push(`[${agent.name}](${agentWebURL}${agent.id})`);
    }
    embed.addFields({
      name: 'Controller',
      value: controllers.join(', '),
    });
  }

  // センチネルが選択されている場合、フィールドを追加
  if (composition.sentinel.length) {
    const sentinels: string[] = [];
    for (const agent of composition.sentinel) {
      sentinels.push(`[${agent.name}](${agentWebURL}${agent.id})`);
    }
    embed.addFields({
      name: 'Sentinel',
      value: sentinels.join(', '),
    });
  }

  const compositionAttachment = new AttachmentBuilder('img/composition.png');
  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

  return {
    embeds: [embed],
    files: [compositionAttachment, fotterAttachment],
  };
};

export const mapMessage = (map: MapData) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Map')
    .setDescription(`今回のマップは${map.name}です`)
    .setImage(`attachment://${map.id}.png`)
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_logo.png',
    });

  const imageAttachment = new AttachmentBuilder(`img/maps/${map.id}.png`);
  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

  return { embeds: [embed], files: [imageAttachment, fotterAttachment] };
};
