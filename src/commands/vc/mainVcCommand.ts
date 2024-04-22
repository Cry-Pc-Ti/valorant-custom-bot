import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const mainVcCommand = {
  data: new SlashCommandBuilder()
    .setName('vc')
    .setDescription('vcのコマンドです。')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('come')
        .setDescription('指定されたVCに全員を集めます。')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('集めるチャンネルを選択')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    if (interaction.options.getSubcommand() === 'come') {
      return;
    }
  },
};
