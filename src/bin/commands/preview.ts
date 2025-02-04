import { Command } from 'commander';

import { MkNotes } from '@/MkNotes';

const COMMAND_NAME = 'preview-sync';
const COMMAND_DESCRIPTION =
  'Preview the synchronization result by displaying the whole notion page architecture that will be created';

/**
 * Command to preview the synchronization result by displaying the whole notion page architecture that will be created
 *
 * @returns {Command} The command
 */
const command = new Command();

command.name(COMMAND_NAME);
command.description(COMMAND_DESCRIPTION);

command.requiredOption(
  '-i, --input <directoryPath>',
  'Path of the directory to synchronize'
);

command.action(async (opts) => {
  const { input: directoryPath } = opts;

  const mkNotes = new MkNotes({
    notionApiKey: '',
  });

  const serializedResult = await mkNotes.previewSynchronization({
    inputPath: directoryPath,
  });

  console.log(serializedResult);
});

// eslint-disable-next-line import/no-default-export
export default command;

if (require.main === module) {
  command
    .parseAsync()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    });
}
