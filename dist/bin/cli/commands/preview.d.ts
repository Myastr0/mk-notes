import { Command } from 'commander';
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
declare const command: Command;
export default command;
