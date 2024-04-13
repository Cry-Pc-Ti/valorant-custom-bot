import { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { AgentData, CompositionData, MapData } from '../types/valorantData';
import { MemberAllocationData } from '../types/memberData';
import { MusicInfo } from '../types/musicData';

const agentWebURL: string = 'https://playvalorant.com/ja-jp/agents/';

// 「/agent」コマンドのメッセージを作成
export const agentMessage = (agent: AgentData) => {
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
      iconURL: 'attachment://valorant_icon.png',
    });

  const thumbnailAttachment = new AttachmentBuilder(`static/img/valorant_agents/${agent.id}_icon.png`);
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return {
    embeds: [embedMessage],
    files: [thumbnailAttachment, fotterAttachment],
  };
};

// 「/composition」コマンドのメッセージを作成
export const compositionMessage = (composition: CompositionData, banAgents: AgentData[]) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Composition')
    .setDescription('今回の構成はこちらです')
    .setImage('attachment://generate_image.png')
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
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

  // BANエージェントが選択されている場合、フィールドを追加
  if (banAgents.length) {
    const bans: string[] = [];
    for (const agent of banAgents) {
      bans.push(agent.name);
    }
    embed.addFields({
      name: 'Ban',
      value: bans.join(', '),
    });
  }

  const concatImageAttachment = new AttachmentBuilder('static/img/generate_image.png');
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return {
    embeds: [embed],
    files: [concatImageAttachment, fotterAttachment],
    components: [],
  };
};

// 「/map」コマンドのメッセージを作成
export const mapMessage = (map: MapData) => {
  const embedMessage = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Map')
    .setDescription(`今回のマップは${map.name}です`)
    .setImage(`attachment://${map.id}.png`)
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    });

  const imageAttachment = new AttachmentBuilder(`static/img/valorant_maps/${map.id}.png`);
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embedMessage], files: [imageAttachment, fotterAttachment] };
};

//「/member」コマンドのメッセージを作成
export const memberAllocationMessage = (memberAllocation: MemberAllocationData) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Team')
    .setDescription('今回のチームはこちらです')
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    });

  if (memberAllocation.attack.length) {
    const attack = [];
    for (const member of memberAllocation.attack) {
      attack.push(`:white_small_square:<@${member.id}>`);
    }

    embeds.addFields({
      name: 'Attacker',
      value: attack.join(`\n`),
    });
  }

  if (memberAllocation.defense.length) {
    const defense = [];
    for (const member of memberAllocation.defense) {
      defense.push(`:white_small_square:<@${member.id}>`);
    }
    embeds.addFields({
      name: 'Defender',
      value: defense.join(`\n`),
    });
  }

  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds, fotterAttachment };
};

//「/dice」コマンドのメッセージを作成
export const diceMessage = (message: string, number: number) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({ name: message, iconURL: 'attachment://gekko_icon.png' })
    .setDescription(`出た数字は${number}だよ～`)
    .setThumbnail('attachment://generate_image.png')
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    });

  const authorAttachment = new AttachmentBuilder('static/img/valorant_agents/gekko_icon.png');
  const imageAttachment = new AttachmentBuilder('static/img/generate_image.png');
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embed], files: [authorAttachment, imageAttachment, fotterAttachment] };
};

//「/chinchiro」コマンドのメッセージを作成
export const chinchiroMessage = (result: string) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('チンチロバトルじゃ！')
    .setFields({
      name: 'ざわ…ざわ…',
      value: `${result}`,
    })
    .setImage('attachment://generate_image.png')
    .setTimestamp();

  const ImageAttachment = new AttachmentBuilder('static/img/generate_image.png');

  return { embeds: [embed], files: [ImageAttachment] };
};

//「/playList」コマンドのメッセージを作成
export const musicInfoMessage = (
    musicInfo: MusicInfo,
    buttonRow: ActionRowBuilder<ButtonBuilder>,
    musicCount?: number,
    maxMusicCount?: number,
    channelThumbnail?: string | null
  ) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(musicInfo.title)
    .setURL(musicInfo.url)
    .setImage(musicInfo.musicImg)
    .setTimestamp();

    if(channelThumbnail){
      embeds.setAuthor({ 
        name: musicInfo.author.name, 
        iconURL: channelThumbnail
      })
    }else if(musicInfo.author.channelThumbnail){
      embeds.setAuthor({ 
        name: musicInfo.author.name, 
        iconURL: musicInfo.author.channelThumbnail
      })
    }else{
      embeds.setAuthor({ 
        name: musicInfo.author.name
      })
    }

    if(!musicCount && !maxMusicCount){
      embeds.setFooter({
        text: '音楽情報',
      });
    } else {
      embeds.setFooter({
        text: '音楽情報・' + musicCount + '/' + maxMusicCount,
      });
    }

  return { embeds: [embeds] ,components: [buttonRow]};
};
