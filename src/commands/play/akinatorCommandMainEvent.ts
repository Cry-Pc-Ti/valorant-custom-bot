import { ChatInputCommandInteraction } from 'discord.js';

export const akinatorCommandMainEvent = async (interaction: ChatInputCommandInteraction) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const akinator = require('discord.js-akinator');
  await akinator(interaction, {
    language: 'ja',
    childMode: false,
    gameType: 'character',
    useButtons: true,
    embedColor: '#fd4556',
    translationCaching: {
      enabled: true,
      path: './translationCache',
    },
  });
};
