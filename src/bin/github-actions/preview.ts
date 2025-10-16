import { getInput, info, setFailed, setOutput } from '@actions/core';

import { isValidFormat } from '@/domains/features/previewSynchronization';
import { MkNotes } from '@/MkNotes';

enum Inputs {
  Input = 'input', // Input file or directory path
  Format = 'format', // Format of the preview
  Output = 'output', // Output file path
}

enum Outputs {
  FilePath = 'file-path', // Output file path
}

export const preview = async (earlyExit: boolean = false) => {
  try {
    const input = getInput(Inputs.Input, { required: true });
    const output = getInput(Inputs.Output, { required: false });
    const format = getInput(Inputs.Format, { required: true });

    if (!isValidFormat(format)) {
      throw new Error(
        `Invalid format: ${format} - must be "plainText" or "json"`
      );
    }

    const mkNotes = new MkNotes({
      notionApiKey: '',
    });

    const result = await mkNotes.previewSynchronization({
      inputPath: input,
      format,
      output,
    });

    if (output) {
      setOutput(Outputs.FilePath, output);
      info(`Preview saved to ${output}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(result);
    }

    // node will stay alive if any promises are not resolved,
    // which is a possibility if HTTP requests are dangling
    // due to retries or timeouts. We know that if we got here
    // that all promises that we care about have successfully
    // resolved, so simply exit with success.

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
  void preview(true);
}
