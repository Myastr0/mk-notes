#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const commands_1 = require("../bin/commands");
const package_json_1 = require("../../package.json");
const CLI_NAME = 'mk-notes';
const CLI_DESCRIPTION = 'Markdown to Notion synchronization CLI 🔄';
const program = new commander_1.Command();
program.name(CLI_NAME);
program.description(CLI_DESCRIPTION);
program.version(package_json_1.version);
(0, commands_1.hookCommands)(program);
program.parse();
