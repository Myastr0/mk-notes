"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = void 0;
const core_1 = require("@actions/core");
const MkNotes_1 = require("../../MkNotes");
const actionUtils_1 = require("./utils/actionUtils");
var Inputs;
(function (Inputs) {
    Inputs["Clean"] = "clean";
    Inputs["Input"] = "input";
    Inputs["NotionApiKey"] = "notion-api-key";
    Inputs["Destination"] = "destination";
})(Inputs || (Inputs = {}));
const sync = async (earlyExit = false) => {
    try {
        const input = (0, core_1.getInput)(Inputs.Input, { required: true });
        const destination = (0, core_1.getInput)(Inputs.Destination, { required: true });
        const notionApiKey = (0, core_1.getInput)(Inputs.NotionApiKey, { required: true });
        const clean = (0, actionUtils_1.getInputAsBool)(Inputs.Clean);
        const mkNotes = new MkNotes_1.MkNotes({
            notionApiKey,
        });
        await mkNotes.synchronizeMarkdownToNotionFromFileSystem({
            inputPath: input,
            parentNotionPageId: destination,
            cleanSync: clean,
        });
        // node will stay alive if any promises are not resolved,
        // which is a possibility if HTTP requests are dangling
        // due to retries or timeouts. We know that if we got here
        // that all promises that we care about have successfully
        // resolved, so simply exit with success.
        (0, core_1.info)(`Synchronization done. View the result at ${destination}`);
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
exports.sync = sync;
if (require.main === module) {
    void (0, exports.sync)(true);
}
