import { getInput, info, setFailed } from '@actions/core';

import { MkNotes } from '@/MkNotes';

import { getInputAsBool } from './utils';

enum Inputs {
  Clean = 'clean', // Clean sync
  Input = 'input', // Input file or directory path
  NotionApiKey = 'notion-api-key', // Notion API key
  Destination = 'destination', // Notion page URL
  Lock = 'lock', // Lock page
  SaveId = 'save-id', // Save ID
  ForceNew = 'force-new', // Force new
}

export const sync = async (earlyExit: boolean = false) => {
  try {
    const input = getInput(Inputs.Input, { required: true });
    const destination = getInput(Inputs.Destination, { required: true });
    const notionApiKey = getInput(Inputs.NotionApiKey, { required: true });
    const clean = getInputAsBool(Inputs.Clean);
    const lock = getInputAsBool(Inputs.Lock) ?? false;
    const saveId = getInputAsBool(Inputs.SaveId);
    const forceNew = getInputAsBool(Inputs.ForceNew);

    const mkNotes = new MkNotes({
      notionApiKey,
    });

    await mkNotes.synchronizeMarkdownToNotionFromFileSystem({
      inputPath: input,
      parentNotionPageId: destination,
      cleanSync: clean,
      lockPage: lock,
      saveId: saveId,
      forceNew: forceNew,
    });

    // node will stay alive if any promises are not resolved,
    // which is a possibility if HTTP requests are dangling
    // due to retries or timeouts. We know that if we got here
    // that all promises that we care about have successfully
    // resolved, so simply exit with success.

    info(`Synchronization done. View the result at ${destination}`);

    if (earlyExit) {
      process.exit(0);
    }
  } catch (error) {
    setFailed((error as Error).message);
    if (earlyExit) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  void sync(true);
}
