import { Command } from 'commander';

import preview from './preview';
import sync from './sync';

export const hookCommands = (program: Command) => {
  program.addCommand(sync);
  program.addCommand(preview);
};
