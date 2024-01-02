import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { EmbedBuilder, AttachmentBuilder } from '../modules/discordModule';
import { AgentData, CompositionData, MapData, MemberAllocationData } from '../types/valorantAgentData';

const agentWebURL: string = 'https://playvalorant.com/ja-jp/agents/';

export const agentMessage = (
  agent: AgentData
): { embeds: EmbedBuilder[]; files: AttachmentBuilder[] } => {
  const embedMessage = new EmbedBuilder()
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

  return { embeds: [embedMessage], files: [thumbnailAttachment, fotterAttachment] };
};

export const compositionMessage = (
  composition: CompositionData
): { embeds: EmbedBuilder[]; files: AttachmentBuilder[] } => {
  const embedMessage = new EmbedBuilder()
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
    embedMessage.addFields({
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
    embedMessage.addFields({
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
    embedMessage.addFields({
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
    embedMessage.addFields({
      name: 'Sentinel',
      value: sentinels.join(', '),
    });
  }

  const compositionAttachment = new AttachmentBuilder('img/composition.png');
  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

  return {
    embeds: [embedMessage],
    files: [compositionAttachment, fotterAttachment],
  };
};

export const mapMessage = (
  map: MapData
): { embeds: EmbedBuilder[]; files: AttachmentBuilder[] } => {
  const embedMessage = new EmbedBuilder()
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

  return { embeds: [embedMessage], files: [imageAttachment, fotterAttachment] };
};

//「/member」コマンドのメッセージを作成
export const memberAllocationMessage = (memberAllocation: MemberAllocationData) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('メンバー振り分け')
    .setDescription('今回のチームはこちらです。')
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_logo.png',
    });
    
    if(memberAllocation.attack.length){
      const attack: string[] = [];
      for (const member of memberAllocation.attack) {
        attack.push(`${member.name} <@${member.id}>`);
      }
      embed.addFields({
        name:  'アタッカーサイド',
        value: attack.join(`\n`),
      })
    }
    if(memberAllocation.defense.length){
      const defense: string[] = [];
      for (const member of memberAllocation.defense) {
        defense.push(`${member.name} <@${member.id}>`);
      }
      embed.addFields({
        name:  'ディフェンダーサイド',
        value: defense.join(`\n`),
      })
    }
    const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

  return { embeds: [embed], files: [fotterAttachment] };
};

export const diceMessage = (randomIndex: Number) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('ダイス')
    .setFields({ name: 'ウィングマン的にはこの数字がいいにょ', value: String(randomIndex)})
    .setTimestamp()

    return { embeds: [embed], files: [] };
}