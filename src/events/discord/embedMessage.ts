import { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { AgentData, CompositionData, MapData } from '../../types/valorantData';
import { TeamData } from '../../types/memberData';
import { MusicInfo, PlayListInfo } from '../../types/musicData';
import { SpotifyPlaylistInfo } from '../../types/spotifyData';

const agentWebUrl: string = 'https://playvalorant.com/ja-jp/agents/';

// agentコマンドのメッセージを作成
export const agentMessage = (agent: AgentData) => {
  const embedMessage = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({
      name: '抽選結果',
      iconURL: 'attachment://surprised_penguin.png',
    })
    .setDescription(`今回のエージェントは**[${agent.name}](${agentWebUrl}${agent.id})**です`)
    .setThumbnail(`attachment://${agent.id}_icon.png`)
    .addFields({
      name: 'ロール',
      value: agent.role,
    })
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  const authorAttachment = new AttachmentBuilder('static/img/icon/surprised_penguin.png');
  const thumbnailAttachment = new AttachmentBuilder(`static/img/valorant_agents/${agent.id}_icon.png`);
  const fotterAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return {
    embeds: [embedMessage],
    files: [authorAttachment, thumbnailAttachment, fotterAttachment],
  };
};

// compositionコマンドのメッセージを作成
export const compositionMessage = (composition: CompositionData, banAgents: AgentData[], userId: string) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({
      name: '抽選結果',
      iconURL: 'attachment://surprised_penguin.png',
    })
    .setDescription('今回の構成はこちらです')
    .setImage(`attachment://${userId}.png`)
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  // デュエリストが選択されている場合、フィールドを追加
  if (composition.duelist.length) {
    const duelists: string[] = [];
    for (const agent of composition.duelist) {
      duelists.push(`[${agent.name}](${agentWebUrl}${agent.id})`);
    }
    embed.addFields({
      name: 'デュエリスト',
      value: duelists.join(', '),
    });
  }

  // イニシエーターが選択されている場合、フィールドを追加
  if (composition.initiator.length) {
    const initiators: string[] = [];
    for (const agent of composition.initiator) {
      initiators.push(`[${agent.name}](${agentWebUrl}${agent.id})`);
    }
    embed.addFields({
      name: 'イニシエーター',
      value: initiators.join(', '),
    });
  }

  // コントローラーが選択されている場合、フィールドを追加
  if (composition.controller.length) {
    const controllers: string[] = [];
    for (const agent of composition.controller) {
      controllers.push(`[${agent.name}](${agentWebUrl}${agent.id})`);
    }
    embed.addFields({
      name: 'コントローラー',
      value: controllers.join(', '),
    });
  }

  // センチネルが選択されている場合、フィールドを追加
  if (composition.sentinel.length) {
    const sentinels: string[] = [];
    for (const agent of composition.sentinel) {
      sentinels.push(`[${agent.name}](${agentWebUrl}${agent.id})`);
    }
    embed.addFields({
      name: 'センチネル',
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
      name: 'BAN',
      value: bans.join(', '),
    });
  }

  const authorAttachment = new AttachmentBuilder('static/img/icon/surprised_penguin.png');
  const concatImageAttachment = new AttachmentBuilder(`static/img/generated/${userId}.png`);
  const fotterAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return {
    embeds: [embed],
    files: [authorAttachment, concatImageAttachment, fotterAttachment],
    components: [],
  };
};

// mapコマンドのメッセージを作成
export const mapMessage = (map: MapData) => {
  const embedMessage = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({
      name: '抽選結果',
      iconURL: 'attachment://surprised_penguin.png',
    })
    .setDescription(`今回のマップは**${map.name}**です`)
    .setThumbnail(map.displayIcon)
    .setImage(map.mapThumbnail)
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  const authorAttachment = new AttachmentBuilder('static/img/icon/surprised_penguin.png');
  const fotterAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return { embeds: [embedMessage], files: [authorAttachment, fotterAttachment], components: [] };
};

// teamコマンドのメッセージを作成
export const teamMessage = (
  memberAllocation: TeamData,
  attackerChannelId: string,
  defenderChannelId: string,
  guildId: string
) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({ name: '抽選結果', iconURL: 'attachment://surprised_penguin.png' })
    .setDescription('今回のチームはこちらです')
    .setThumbnail('https://www.streetfighter.com/6/assets/images/character/jamie/jamie.png')
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
      name: `【アタッカーサイド】\nVC：https://discord.com/channels/${guildId}/${attackerChannelId}`,
      value: attack.join(`\n`),
      inline: true,
    });
  }

  if (memberAllocation.defense.length) {
    const defense = [];
    for (const member of memberAllocation.defense) {
      defense.push(`:white_small_square:<@${member.id}>`);
    }
    embeds.addFields({
      name: `【ディフェンダーサイド】 \nVC：https://discord.com/channels/${guildId}/${defenderChannelId}`,
      value: defense.join(`\n`),
      inline: true,
    });
  }

  const authorAttachment = new AttachmentBuilder('static/img/icon/surprised_penguin.png');
  const fotterAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return { embeds: [embeds], files: [authorAttachment, fotterAttachment], components: [] };
};

// diceコマンドのメッセージを作成
export const diceMessage = (message: string, number: number, userId: string) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({ name: message, iconURL: 'attachment://gekko_icon.png' })
    .setDescription(`出た数字は${number}だよ～`)
    .setThumbnail(`attachment://${userId}.png`)
    .setFooter({
      text: 'VALORANT',
      iconURL: `attachment://valorant_icon.png`,
    })
    .setTimestamp();

  const authorAttachment = new AttachmentBuilder('static/img/valorant_agents/gekko_icon.png');
  const imageAttachment = new AttachmentBuilder(`static/img/generated/${userId}.png`);
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embed], files: [authorAttachment, imageAttachment, fotterAttachment] };
};

// chinchiroコマンドのメッセージを作成
// イカサマなしの場合
export const chinchiroMessage = (result: string, userId: string) => {
  const embed = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({ name: 'チンチロバトルじゃ！', iconURL: 'attachment://go_again.png' })
    .setFields({
      name: 'ざわ…ざわ…',
      value: `${result}`,
    })
    .setImage(`attachment://${userId}.png`)
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  const authorAttachment = new AttachmentBuilder('static/img/icon/go_again.png');
  const imageAttachment = new AttachmentBuilder(`static/img/generated/${userId}.png`);
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embed], files: [authorAttachment, imageAttachment, fotterAttachment] };
};

// イカサマありの場合
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

  const authorAttachment = new AttachmentBuilder('static/img/icon/radianite_box.png');
  const imageAttachment = new AttachmentBuilder('static/img/dice/456dice.png');
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embed], files: [authorAttachment, imageAttachment, fotterAttachment] };
};

// playコマンドのメッセージを作成
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

// playListコマンドのメッセージを作成
export const musicInfoPlayListMessage = (
  playListInfo: PlayListInfo,
  buttonRowList: ActionRowBuilder<ButtonBuilder>[],
  musicCount: number,
  channelThumbnail: string | undefined,
  // 0: playCommand,1: searchCommand
  commandFlg: number
) => {
  const embeds = new EmbedBuilder().setColor('#fd4556');

  // play
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

    // search
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

// 再生準備中のメッセージを作成(recommend)
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

// 再生準備中のメッセージを作成(hitsong)
export const hitSongsPreparingPlayerMessage = (spotifyPlaylistInfo: SpotifyPlaylistInfo) => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(`${spotifyPlaylistInfo.title}で検索中です。\n少々お待ちください\n\n※hitsongはspotify調べです。`)
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
