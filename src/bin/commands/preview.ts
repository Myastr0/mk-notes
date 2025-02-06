import { Command, Option } from 'commander';

import { PreviewFormat } from '@/domains';
import { MkNotes } from '@/MkNotes';

const COMMAND_NAME = 'preview-sync';
const COMMAND_DESCRIPTION =
  'Preview the synchronization result by displaying the whole notion page architecture that will be created';

/**
 * Command to preview the synchronization result by displaying the whole notion page architecture that will be created
 *
 * ```sh
 *    mk-notes preview-sync -i <directoryPath>
 * ```
 *
 * Example:
 *
 * Running the following command :
 * ```sh
 *   mk-notes preview-sync --input ./notes
 * ```
 *
 * Output:
 * ```txt
 * ├─  (Your parent Notion Page)
 * │   ├─ /notes/0-installation.md (0-installation.md)
 * │   ├─ /notes/1-getting-started.md (1-getting-started.md)
 * │   ├─ /notes/2-context-management/1-how-to-manage-context.md (2-context-management)
 * │   │   ├─ /notes/2-context-management/2-how-to-manage-app.md (2-how-to-manage-app.md)
 * │   │   ├─ /notes/2-context-management/Context management.md (Context management.md)
 * │   ├─ /notes/README.md (README.md)
 * ```
 *
 * For more information about the generation of this preview, please refer to the SiteMap builder behavior.
 */
const command = new Command();

command.name(COMMAND_NAME);
command.description(COMMAND_DESCRIPTION);

command.requiredOption(
  '-i, --input <directoryPath>',
  '[Required] Path of the directory to synchronize'
);

command.addOption(
  new Option('-f, --format <format>', 'Format of the preview')
    .choices(['plainText', 'json'])
    .default('plainText')
);

command.option('-o, --output <output>', 'Output file path');

command.action(
  async (opts: { input: string; format: PreviewFormat; output?: string }) => {
    const { input: directoryPath, format, output } = opts;

    const mkNotes = new MkNotes({
      notionApiKey: '',
    });

    await mkNotes.previewSynchronization({
      inputPath: directoryPath,
      format,
      output,
    });
  }
);

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
