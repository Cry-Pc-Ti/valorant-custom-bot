// help コマンドを作成
import { SlashCommandBuilder } from '../modules/discordModule';

export const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('コマンドの一覧を表示します')
    .toJSON(),
};
