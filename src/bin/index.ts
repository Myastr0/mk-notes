#!/usr/bin/env node

import { Command } from 'commander';

import { hookCommands } from '@/bin/commands';

const CLI_NAME = 'mk-notes';
const CLI_DESCRIPTION = 'Markdown to Notion synchronization CLI 🔄';

const program = new Command();

program.name(CLI_NAME);
program.description(CLI_DESCRIPTION);

hookCommands(program);

program.parse();
