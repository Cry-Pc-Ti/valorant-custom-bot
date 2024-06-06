import { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { AgentData, CompositionData, MapData } from '../../types/valorantData';
import { MemberAllocationData } from '../../types/memberData';
import { MusicInfo, PlayListInfo } from '../../types/musicData';
import { SpotifyPlaylistInfo } from '../../types/spotifyData';

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
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

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
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

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
    .setThumbnail(map.displayIcon)
    .setImage(map.mapThumbnail)
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embedMessage], files: [fotterAttachment] };
};

//「/member」コマンドのメッセージを作成
export const memberAllocationMessage = (memberAllocation: MemberAllocationData) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('Random Team')
    .setDescription('今回のチームはこちらです')
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

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
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  const authorAttachment = new AttachmentBuilder('static/img/valorant_agents/gekko_icon.png');
  const imageAttachment = new AttachmentBuilder('static/img/generate_image.png');
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embed], files: [authorAttachment, imageAttachment, fotterAttachment] };
};

//「/chinchiro」コマンドのメッセージを作成
export const chinchiroMessage = (result: string) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({ name: 'チンチロバトルじゃ！', iconURL: 'attachment://radianite_box.png' })
    .setFields({
      name: 'ざわ…ざわ…',
      value: `${result}`,
    })
    .setImage('attachment://generate_image.png')
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  const authorAttachment = new AttachmentBuilder('static/img/dice/radianite_box.png');
  const imageAttachment = new AttachmentBuilder('static/img/generate_image.png');
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embed], files: [authorAttachment, imageAttachment, fotterAttachment] };
};

export const chinchiro456Message = (result: string) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({ name: 'チンチロバトルじゃ！', iconURL: 'attachment://radianite_box.png' })
    .setFields({
      name: 'ざわ…ざわ…',
      value: `${result}`,
    })
    .setImage('attachment://456dice.png')
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  const authorAttachment = new AttachmentBuilder('static/img/dice/radianite_box.png');
  const imageAttachment = new AttachmentBuilder('static/img/dice/456dice.png');
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embed], files: [authorAttachment, imageAttachment, fotterAttachment] };
};
//「/play」コマンドのメッセージを作成
export const musicInfoMessage = (musicInfo: MusicInfo, buttonRowList: ActionRowBuilder<ButtonBuilder>[]) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(musicInfo.title)
    .setURL(musicInfo.url ?? null)
    .setImage(musicInfo.musicImg ?? null)
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  if (musicInfo.author.channelThumbnail) {
    embeds.setAuthor({
      name: musicInfo.author.name,
      iconURL: musicInfo.author.channelThumbnail,
    });
  } else {
    embeds.setAuthor({
      name: musicInfo.author.name,
    });
  }

  const fotterAttachment = new AttachmentBuilder(`static/img/icon/youtube_icon.png`);

  return { embeds: [embeds], files: [fotterAttachment], components: buttonRowList };
};
//「/playList」コマンドのメッセージを作成
export const musicInfoPlayListMessage = (
  playListInfo: PlayListInfo,
  buttonRowList: ActionRowBuilder<ButtonBuilder>[],
  musicCount: number,
  channelThumbnail: string | null,
  // 0: playCommand,1: searchCommand
  commandFlg: number
) => {
  const embeds = new EmbedBuilder().setColor('#fd4556');

  // playCommand
  if (commandFlg === 0) {
    embeds.addFields({
      name: 'プレイリスト',
      value: `【[${playListInfo.title}](${playListInfo.url})】を再生中🎵 `,
      inline: true,
    });
    if (playListInfo.musicInfo.length) {
      embeds.addFields({
        name: '曲順',
        value: `${musicCount} / ${playListInfo.musicInfo.length}`,
        inline: true,
      });
    }

    // searchCommand
  } else if (commandFlg === 1) {
    embeds.addFields(
      {
        name: '検索したワード',
        value: `${playListInfo.searchWord}`,
        inline: true,
      },
      {
        name: '曲順',
        value: `${musicCount} / ${playListInfo.musicInfo.length}`,
        inline: true,
      }
    );
    // recommend
  } else if (commandFlg === 2) {
    embeds.addFields(
      {
        name: '最初に指定した楽曲',
        value: `${playListInfo.title}`,
      },
      {
        name: '曲順',
        value: `${musicCount} / ${playListInfo.musicInfo.length}`,
        inline: true,
      }
    );
    // hitsong
  } else if (commandFlg === 3) {
    embeds.addFields({
      name: playListInfo.title,
      value: playListInfo.description ?? '',
    });
    if (playListInfo.rankingFlag) {
      embeds.addFields({
        name: `順位`,
        value: `${musicCount}位`,
        inline: true,
      });
    } else {
      embeds.addFields({
        name: '曲順',
        value: `${musicCount} / ${playListInfo.musicInfo.length}`,
        inline: true,
      });
    }
  }

  if (musicCount === playListInfo.musicInfo.length) {
    embeds.addFields({ name: '次の曲', value: `曲の情報がありません。` });
  } else {
    embeds.addFields({
      name: '次の曲',
      value: `[${playListInfo.musicInfo[musicCount].title}](${playListInfo.musicInfo[musicCount].url})`,
    });
  }
  const embeds2 = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(playListInfo.musicInfo[musicCount - 1].title)
    .setURL(playListInfo.musicInfo[musicCount - 1].url ?? null)
    .setImage(playListInfo.musicInfo[musicCount - 1].musicImg ?? null)
    .setFooter({
      text: `YouTube Playlist`,
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  if (channelThumbnail) {
    embeds2.setAuthor({
      name: playListInfo.musicInfo[musicCount - 1].author.name,
      iconURL: channelThumbnail,
    });
  } else {
    embeds2.setAuthor({
      name: playListInfo.musicInfo[musicCount - 1].author.name,
    });
  }

  const fotterAttachment = new AttachmentBuilder(`static/img/icon/youtube_icon.png`);

  return { embeds: [embeds, embeds2], files: [fotterAttachment], components: buttonRowList };
};
// playList再生準備中のメッセージを作成(play)
export const playListPlayMusicMessage = () => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(`プレイリスト情報を取得しております。少々お待ちください\n\n※取得に時間がかかる場合がございます。`)
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const fotterAttachment = new AttachmentBuilder(`static/img/icon/youtube_icon.png`);

  return { embeds: [embeds], files: [fotterAttachment], components: [] };
};

// 再生準備中のメッセージを作成(レコメンド)
export const preparingPlayerMessage = () => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('関連の楽曲を探しております。少々お待ちください')
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const fotterAttachment = new AttachmentBuilder(`static/img/icon/youtube_icon.png`);

  return { embeds: [embeds], files: [fotterAttachment], components: [] };
};

// 再生準備中のメッセージを作成(ヒットソング)
export const hitSongsPreparingPlayerMessage = (spotifyPlaylistInfo: SpotifyPlaylistInfo) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(`${spotifyPlaylistInfo.name}を検索中です。\n少々お待ちください\n\n※hitsongはspotify調べです。`)
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const fotterAttachment = new AttachmentBuilder(`static/img/icon/youtube_icon.png`);

  return { embeds: [embeds], files: [fotterAttachment], components: [] };
};

// 再生途中のメッセージを作成
export const terminateMidwayPlayerMessage = () => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('途中で再生が終了しました。')
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const fotterAttachment = new AttachmentBuilder(`static/img/icon/youtube_icon.png`);

  return { embeds: [embeds], files: [fotterAttachment], components: [] };
};

// 再生完了のメッセージを作成
export const donePlayerMessage = () => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('再生完了')
    .setFooter({
      text: 'YouTube',
      iconURL: 'attachment://youtube_icon.png',
    })
    .setTimestamp();

  const fotterAttachment = new AttachmentBuilder(`static/img/icon/youtube_icon.png`);

  return { embeds: [embeds], files: [fotterAttachment], components: [] };
};
