import { Command } from 'commander';

import { MkNotes } from '@/MkNotes';

const COMMAND_NAME = 'sync';
const COMMAND_DESCRIPTION =
  'Synchronize a markdown file or directory to a dedicated notion page';

const command = new Command();

command.name(COMMAND_NAME);
command.description(COMMAND_DESCRIPTION);

command.requiredOption(
  '-i, --input <path>',
  'Path of the markdown file or directory to synchronize'
);

command.requiredOption(
  '-d, --destination <notionPageUrl>',
  'Url of the parent notion page to store the synchronized file'
);

command.requiredOption(
  '-k, --notion-api-key <notionApiKey>',
  'The Notion API to use to launch the synchronization'
);

command.option(
  '-c, --clean',
  'Clean sync - WARNING: removes ALL existing content from the destination page before syncing, including any custom content not created by mk-notes'
);

interface SyncOptions {
  input: string;
  destination: string;
  notionApiKey: string;
  clean?: boolean;
}

command.action(async (opts: SyncOptions) => {
  const {
    input: inputPath,
    destination: notionParentPageUrl,
    notionApiKey,
    clean = false,
  } = opts;

  const mkNotes = new MkNotes({ notionApiKey });

  await mkNotes.synchronizeMarkdownToNotionFromFileSystem({
    inputPath: inputPath,
    parentNotionPageId: notionParentPageUrl,
    cleanSync: clean,
  });

  // eslint-disable-next-line no-console
  console.log(
    `Synchronization done. View the result at ${notionParentPageUrl}`
  );
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
