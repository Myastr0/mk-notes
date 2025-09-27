"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookCommands = void 0;
const preview_1 = __importDefault(require("./preview"));
const sync_1 = __importDefault(require("./sync"));
const hookCommands = (program) => {
    program.addCommand(sync_1.default);
    program.addCommand(preview_1.default);
};
exports.hookCommands = hookCommands;
