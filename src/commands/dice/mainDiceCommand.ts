import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { chinchiroCommandMainEvent } from './chinchiroCommandMainEvent';
import { numberCommandMainEvent } from './numberCommandMainEvent';

export const mainDiceCommand = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('音楽関連のコマンドです。')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('chinchiro')
        .setDescription('ざわ…ざわ…')
        .addStringOption((option) =>
          option
            .setName('cheat')
            .setDescription('魔法の賽を...!!')
            .addChoices({ name: 'この力がほしい...!!', value: 'true' })
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('number').setDescription('1から100までの数字をランダムに出します')
    )
    .toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    // chinchiroCommand
    if (interaction.options.getSubcommand() === 'chinchiro') {
      await chinchiroCommandMainEvent(interaction);
      // numberCommand
    } else if (interaction.options.getSubcommand() === 'number') {
      await numberCommandMainEvent(interaction);
    }
  },
};
