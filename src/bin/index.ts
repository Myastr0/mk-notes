#!/usr/bin/env node

import { Command } from 'commander';

import { hookCommands } from '@/bin/commands';

import { version } from '../../package.json';

const CLI_NAME = 'mk-notes';
const CLI_DESCRIPTION = 'Markdown to Notion synchronization CLI 🔄';

const program = new Command();

program.name(CLI_NAME);
program.description(CLI_DESCRIPTION);
program.version(version);

hookCommands(program);

program.parse();
