import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { playCommandMainEvent } from './playCommandMainEvent';
import { disconnectCommandMainEvent } from './disconnectCommandMainEvent';
import { searchCommandMainEvent } from './searchCommandMainEvent';
import { recommendCommandMainEvent } from './recommendCommandMainEvent';

export const musicCommand = {
  // コマンドの設定
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('音楽関連のコマンドです。')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('VCで音楽を流します。')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('音楽を流すチャンネルを選択')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .addBooleanOption((option) =>
          option
            .setName('shuffle')
            .setDescription('プレイリストをランダムに再生したい場合はtrueを入れてください')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('url').setDescription('再生したいURLを入力（プレイリストも可）').setRequired(true)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('disconnect').setDescription('BOTをVCから切断します。'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('入力されたワードからplayListを検索して再生します')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('音楽を流すチャンネルを選択')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .addStringOption((option) =>
          option.setName('words').setDescription('検索したいワードを入力してください').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('recommend')
        .setDescription('指定されたURLから関連のある曲を再生します（新しい曲探しの旅に出たい方はどうぞ）')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('音楽を流すチャンネルを選択')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .addStringOption((option) =>
          option.setName('url').setDescription('再生したいURLを入力（プレイリストも可）').setRequired(true)
        )
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    // 「disconnect」コマンド
    if (interaction.options.getSubcommand() === 'disconnect') {
      await disconnectCommandMainEvent(interaction);
      // 「play」コマンド
    } else if (interaction.options.getSubcommand() === 'play') {
      await playCommandMainEvent(interaction);
      // 「search」コマンド
    } else if (interaction.options.getSubcommand() === 'search') {
      await searchCommandMainEvent(interaction);
      // 「recommend」コマンド
    } else if (interaction.options.getSubcommand() === 'recommend') {
      await recommendCommandMainEvent(interaction);
    }
  },
};
