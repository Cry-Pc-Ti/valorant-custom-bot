import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { AgentData, CompositionData, MapData, MemberAllocationData } from '../types/valorantAgentData';
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
      iconURL: 'attachment://valorant_logo.png',
    });

  const thumbnailAttachment = new AttachmentBuilder(`img/agents/${agent.id}_icon.png`);
  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

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
    .setImage('attachment://concat_image.png')
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

  const concatImageAttachment = new AttachmentBuilder('img/concat_image.png');
  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

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
      iconURL: 'attachment://valorant_logo.png',
    });

  const imageAttachment = new AttachmentBuilder(`img/maps/${map.id}.png`);
  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

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
      iconURL: 'attachment://valorant_logo.png',
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

  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

  return { embeds, fotterAttachment };
};

//「/dice」コマンドのメッセージを作成
export const diceMessage = (randomIndex: number) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Number')
    .setFields({
      name: 'ウィングマン的にはこの数字がいいにょ',
      value: `${randomIndex}`,
    })
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_logo.png',
    });

  const fotterAttachment = new AttachmentBuilder(`img/logo/valorant_logo.png`);

  return { embeds: [embeds], files: [fotterAttachment] };
};

//「/chinchiro」コマンドのメッセージを作成
export const chinchiroMessage = (result: string) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('チンチロバトルじゃ！')
    .setFields({
      name: 'ざわ…ざわ…',
      value: '結果 ' + result,
    })
    .setImage('attachment://concat_image.png')
    .setTimestamp()
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_logo.png',
    });

  return { embeds: [embeds], files: [] };
};

//「/playList」コマンドのメッセージを作成
// TODO:setAuthorのiconURLを取得してくる（チャンネルのアイコン）
export const musicInfoMessage = (musicInfo: MusicInfo,musicCount?: number,maxMusicCount?: number) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(musicInfo.title)
    .setURL(musicInfo.url)
    .setAuthor({ name: musicInfo.author.name, iconURL: musicInfo.author.thumbnails})
    .setImage(musicInfo.musicImg)
    .setTimestamp()

    if(!musicCount && !maxMusicCount){
      embeds.setFooter({
        text: '音楽情報',
      });
    } else {
      embeds.setFooter({
        text: '音楽情報 ' + String(musicCount) + '/' + String(maxMusicCount),
      });
    }

  return { embeds: [embeds], files: [] };
};