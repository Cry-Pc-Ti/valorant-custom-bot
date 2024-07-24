import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

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

  const authorAttachment = new AttachmentBuilder('static/img/icon/gekko_icon.png');
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
    .setAuthor({ name: 'チンチロバトルじゃ！', iconURL: 'attachment://go_again.png' })
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

  const authorAttachment = new AttachmentBuilder('static/img/icon/go_again.png');
  const imageAttachment = new AttachmentBuilder('static/img/dice/456dice.png');
  const fotterAttachment = new AttachmentBuilder(`static/img/icon/valorant_icon.png`);

  return { embeds: [embed], files: [authorAttachment, imageAttachment, fotterAttachment] };
};
