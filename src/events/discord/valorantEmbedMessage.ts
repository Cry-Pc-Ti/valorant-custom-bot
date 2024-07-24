import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { TeamPattern, ValorantUser } from '../../types/valorantUserData';
import { rankEmojis } from '../../constants';
import { AgentData, CompositionData, MapData } from '../../types/valorantData';

const AGENT_WEB_URL: string = 'https://playvalorant.com/ja-jp/agents/';

/**
 * agentコマンドのメッセージを作成
 * @param {AgentData} agent - エージェントのデータ
 * @param {boolean} roleFlag - ロールを表示するかのフラグ
 * @returns {Object} Discordメッセージオブジェクト
 */
export const agentMessage = (
  agent: AgentData,
  roleFlag: boolean
): { embeds: EmbedBuilder[]; files: AttachmentBuilder[] } => {
  const embedMessage = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({
      name: '抽選結果',
      iconURL: 'attachment://surprised_penguin.png',
    })
    .setDescription(
      `今回のエージェントは**[${agent.name}](${AGENT_WEB_URL}${agent.id})**です。\n\n${agent.description}`
    )
    .setThumbnail(agent.iconUrl)
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  if (roleFlag) {
    embedMessage.addFields({
      name: '指定したロール',
      value: agent.role,
    });
  }

  const authorAttachment = new AttachmentBuilder('static/img/icon/surprised_penguin.png');
  const footerAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return {
    embeds: [embedMessage],
    files: [authorAttachment, footerAttachment],
  };
};

/**
 * compositionコマンドのメッセージを作成
 * @param {CompositionData} composition - エージェントの構成データ
 * @param {AgentData[]} banAgents - BANされたエージェントのデータ配列
 * @param {string} userId - ユーザーID
 * @returns {Object} Discordメッセージオブジェクト
 */
export const compositionMessage = (
  composition: CompositionData,
  banAgents: AgentData[],
  userId: string
): { embeds: EmbedBuilder[]; files: AttachmentBuilder[]; components: [] } => {
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
      duelists.push(`[${agent.name}](${AGENT_WEB_URL}${agent.id})`);
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
      initiators.push(`[${agent.name}](${AGENT_WEB_URL}${agent.id})`);
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
      controllers.push(`[${agent.name}](${AGENT_WEB_URL}${agent.id})`);
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
      sentinels.push(`[${agent.name}](${AGENT_WEB_URL}${agent.id})`);
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
  const footerAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return {
    embeds: [embed],
    files: [authorAttachment, concatImageAttachment, footerAttachment],
    components: [],
  };
};

/**
 * mapコマンドのメッセージを作成
 * @param {MapData} map - マップのデータ
 * @returns {Object} Discordメッセージオブジェクト
 */
export const mapMessage = (map: MapData): { embeds: EmbedBuilder[]; files: AttachmentBuilder[]; components: [] } => {
  const embedMessage = new EmbedBuilder()
    .setColor('#fd4556')
    .setAuthor({
      name: '抽選結果',
      iconURL: 'attachment://surprised_penguin.png',
    })
    .setDescription(`今回のマップは**${map.name}**です`)
    .setThumbnail(map.miniMapUrl)
    .setImage(map.thumbnailUrl)
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    });

  const authorAttachment = new AttachmentBuilder('static/img/icon/surprised_penguin.png');
  const footerAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return { embeds: [embedMessage], files: [authorAttachment, footerAttachment], components: [] };
};

/**
 * ランク情報のメッセージ
 *
 * @param valorantUser - ValorantUser
 */
export const rankInfoMessage = (valorantUser: ValorantUser) => {
  const emoji = rankEmojis[`${valorantUser.rank}${valorantUser.rankNum ?? ''}`];
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(`${valorantUser.displayName}さんの現在のランク情報`)
    .setThumbnail(valorantUser.userIcon)
    .addFields(
      { name: 'RIOT-ID', value: `${valorantUser.riotId}#${valorantUser.riotIdTag}`, inline: false },
      { name: 'ランク', value: `${emoji}${valorantUser.rank} ${valorantUser.rankNum ?? ''}`, inline: true },
      { name: 'ポイント', value: `${valorantUser.rankRr} RR`, inline: true }
    );

  return { embeds: [embeds], files: [], components: [] };
};

/**
 * teamコマンドのメッセージ(ランダム)
 *
 * @param teamPatterns - チーム情報の配列
 * @param buttonRow - ボタン
 * @param attackerChannelId - アタッカー側のVCのチャンネルID
 * @param defenderChannelId - ディフェンダー側のVCのチャンネルID
 * @param guildId - ギルドID
 * @param nowPatternIndex - 今のパターンナンバー
 */
export const teamMessage = (
  teamPatterns: TeamPattern[],
  buttonRow: ActionRowBuilder<ButtonBuilder>,
  attackerChannelId: string,
  defenderChannelId: string,
  guildId: string,
  nowPatternIndex: number
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

  if (teamPatterns[nowPatternIndex].teams.attack.length) {
    const attack = [];
    for (const member of teamPatterns[nowPatternIndex].teams.attack) {
      attack.push(`:white_small_square:<@${member.id}>`);
    }
    embeds.addFields({
      name: `【アタッカーサイド】\nVC：https://discord.com/channels/${guildId}/${attackerChannelId}`,
      value: attack.join(`\n`),
      inline: true,
    });
  }

  if (teamPatterns[nowPatternIndex].teams.defense.length) {
    const defense = [];
    for (const member of teamPatterns[nowPatternIndex].teams.defense) {
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

  return { embeds: [embeds], files: [authorAttachment, fotterAttachment], components: [buttonRow] };
};

/**
 * teamコマンドのメッセージ(オートバランス)
 *
 * @param teamPatterns - チーム情報の配列
 * @param buttonRow - ボタン
 * @param attackerChannelId - アタッカー側のVCのチャンネルID
 * @param defenderChannelId - ディフェンダー側のVCのチャンネルID
 * @param guildId - ギルドID
 * @param nowPatternIndex - 今のパターンナンバー
 */
export const teamAutoBalanceMessage = (
  teamPatterns: TeamPattern[],
  buttonRow: ActionRowBuilder<ButtonBuilder>,
  attackerChannelId: string,
  defenderChannelId: string,
  guildId: string,
  nowPatternIndex: number
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

  if (teamPatterns[nowPatternIndex].teams.attack.length) {
    const attack = [];
    for (const member of teamPatterns[nowPatternIndex].teams.attack) {
      const emoji = rankEmojis[`${member.rank}${member.rankNum ?? ''}`];
      attack.push(`${emoji}:<@${member.id}>`);
    }
    embeds.addFields({
      name: `【アタッカーサイド】\nVC：https://discord.com/channels/${guildId}/${attackerChannelId}`,
      value: attack.join(`\n`),
      inline: true,
    });
  }

  if (teamPatterns[nowPatternIndex].teams.defense.length) {
    const defense = [];
    for (const member of teamPatterns[nowPatternIndex].teams.defense) {
      const emoji = rankEmojis[`${member.rank}${member.rankNum ?? ''}`];
      defense.push(`${emoji}:<@${member.id}>`);
    }
    embeds.addFields({
      name: `【ディフェンダーサイド】 \nVC：https://discord.com/channels/${guildId}/${defenderChannelId}`,
      value: defense.join(`\n`),
      inline: true,
    });
  }
  embeds.addFields(
    {
      name: `パターン`,
      value: `${nowPatternIndex + 1} / ${teamPatterns.length}`,
      inline: false,
    },
    {
      name: `レート差`,
      value: `${teamPatterns[nowPatternIndex].attackScore - teamPatterns[nowPatternIndex].defenseScore}`,
      inline: false,
    }
  );

  const authorAttachment = new AttachmentBuilder('static/img/icon/surprised_penguin.png');
  const fotterAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return { embeds: [embeds], files: [authorAttachment, fotterAttachment], components: [buttonRow] };
};

/**
 * チームを振り分け中のメッセージを作成
 * @returns {Object} Discordメッセージオブジェクト
 */
export const teamCommandMessage = () => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle(`チームの振り分け中です。\n\n振り分け後は出てきたボタンを押すとVCにメンバーを飛ばせます。`)
    .setFooter({
      text: 'VALORANT',
      iconURL: 'attachment://valorant_icon.png',
    })
    .setTimestamp();

  const fotterAttachment = new AttachmentBuilder('static/img/icon/valorant_icon.png');

  return { embeds: [embeds], files: [fotterAttachment], components: [] };
};

/**
 * 登録時にRIOTIDでエラーが起きたときのメッセージEMBED
 *
 * @return embeds
 */
export const riotIdErrorMessage = () => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('不正なRiot ID')
    .setDescription(
      '入力されたRiot IDが間違っています。名前だけでなくタグも入力されているかご確認しください。\nまた、IDを変更した場合は新しいIDを入力してください。\n\n間違ったRiot ID: wingmankun328\n正しいRiot ID: wingmankun328#desu'
    );
  return { embeds: [embeds], files: [], components: [] };
};

/**
 * 登録時にRIOTIDが存在しないIDの時のメッセージEMBED
 *
 * @return embeds
 */
export const riotIdUnkowunsMessage = () => {
  const embeds = new EmbedBuilder()
    .setColor('#fd4556')
    .setTitle('IDが見つかりません')
    .setDescription(
      'Riot IDが登録されていません。以下のコマンドを入力してください。\n\n`/valo rank riot-id:[あなたのID]`'
    );
  return { embeds: [embeds], files: [], components: [] };
};
