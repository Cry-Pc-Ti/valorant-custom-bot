import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { playCommandMainEvent } from './mainEvent/playCommandMainEvent';
import { hitSongsCommandMainEvent } from './mainEvent/hitSongsCommandMainEvent';
import { spotifyPlaylistId } from '../../events/common/readJsonData';
import { disconnectCommandMainEvent } from './mainEvent/disconnectCommandMainEvent';
import { searchCommandMainEvent } from './mainEvent/searchCommandMainEvent';
import { recommendCommandMainEvent } from './mainEvent/recommendCommandMainEvent';

export const COMMAND_NAME_MUSIC: string = 'music';

export const mainMusicCommand = {
  // コマンドの設定
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME_MUSIC)
    .setDescription('音楽関連のコマンドです。')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('play')
        .setDescription('VCで音楽を流します。')
        .addStringOption((option) =>
          option
            .setName('shuffle')
            .setDescription('プレイリストをランダムに再生したい場合はtrueを入れてください')
            .setRequired(true)
            .setChoices({ name: 'する', value: 'true' }, { name: 'しない', value: 'false' })
        )
        .addStringOption((option) =>
          option.setName('url').setDescription('再生したいURLを入力（プレイリストも可）').setRequired(true)
        )
    )
    .addSubcommand((subcommand) => subcommand.setName('disconnect').setDescription('BOTをVCから切断します。'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('search')
        .setDescription('入力されたワードから検索して再生します')
        .addStringOption((option) =>
          option.setName('words').setDescription('検索したいワードを入力してください').setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('type').setDescription('選択してください').setRequired(true).setChoices(
            {
              name: '動画を検索',
              value: 'video',
            },
            {
              name: 'プレイリストを検索',
              value: 'playlist',
            }
          )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('recommend')
        .setDescription('指定されたURLから関連のある曲を再生します（新しい曲探しの旅に出たい方はどうぞ）')
        .addStringOption((option) =>
          option.setName('url').setDescription('再生したいURLを入力（プレイリストも可）').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('hitsongs')
        .setDescription('ヒットソングを再生します。')
        .addNumberOption((option) =>
          option
            .setName('genre')
            .setDescription('ジャンルを選択してください')
            .setRequired(true)
            .setChoices(
              ...Object.values(
                spotifyPlaylistId.map((item, index) => {
                  return {
                    name: item.name,
                    value: index,
                  };
                })
              )
            )
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
      // 「hitsongs」コマンド
    } else if (interaction.options.getSubcommand() === 'hitsongs') {
      await hitSongsCommandMainEvent(interaction);
    }
  },
};
