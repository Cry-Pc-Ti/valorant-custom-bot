import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { akinatorCommandMainEvent } from '../akinatorCommandMainEvent';

export const gameCommand = {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('gameコマンドです')
    .addSubcommand((subcommand) => subcommand.setName('akinator').setDescription('アキネーターできます。'))
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    if (interaction.options.getSubcommand() === 'akinator') {
      await akinatorCommandMainEvent(interaction);
    }
  },
};
