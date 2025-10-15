"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preview = void 0;
const core_1 = require("@actions/core");
const previewSynchronization_1 = require("../../domains/features/previewSynchronization");
const MkNotes_1 = require("../../MkNotes");
var Inputs;
(function (Inputs) {
    Inputs["Input"] = "input";
    Inputs["Format"] = "format";
    Inputs["Output"] = "output";
})(Inputs || (Inputs = {}));
var Outputs;
(function (Outputs) {
    Outputs["FilePath"] = "file-path";
})(Outputs || (Outputs = {}));
const preview = async (earlyExit = false) => {
    try {
        const input = (0, core_1.getInput)(Inputs.Input, { required: true });
        const output = (0, core_1.getInput)(Inputs.Output, { required: false });
        const format = (0, core_1.getInput)(Inputs.Format, { required: true });
        if (!(0, previewSynchronization_1.isValidFormat)(format)) {
            throw new Error(`Invalid format: ${format} - must be "plainText" or "json"`);
        }
        const mkNotes = new MkNotes_1.MkNotes({
            notionApiKey: '',
        });
        await mkNotes.previewSynchronization({
            inputPath: input,
            format,
            output,
        });
        if (output) {
            (0, core_1.setOutput)(Outputs.FilePath, output);
        }
        // node will stay alive if any promises are not resolved,
        // which is a possibility if HTTP requests are dangling
        // due to retries or timeouts. We know that if we got here
        // that all promises that we care about have successfully
        // resolved, so simply exit with success.
        (0, core_1.info)(`Preview saved to ${output}`);
        if (earlyExit) {
            process.exit(0);
        }
    }
    catch (error) {
        (0, core_1.setFailed)(error.message);
        if (earlyExit) {
            process.exit(1);
        }
    }
};
exports.preview = preview;
if (require.main === module) {
    void (0, exports.preview)(true);
}
