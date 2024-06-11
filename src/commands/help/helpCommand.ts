import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const helpCommand = {
  data: new SlashCommandBuilder().setName('help').setDescription('何かまよったらこちらへ！').toJSON(),

  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    interaction.editReply(
      `何かお困りの際はこちらをご確認ください。\nそれでも解決しない場合は記載されている連絡先にご連絡ください\nhttps://wingman-kun.notion.site/Discord-Bot-b9b2f66d841b440f9a4e466aedc5fa49`
    );
  },
};
