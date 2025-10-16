#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ActionConfig {
  name: string;
  sourceFile: string;
  outputDir: string;
  outputFile: string;
}

const actions: ActionConfig[] = [
  {
    name: 'sync',
    sourceFile: 'src/bin/github-actions/sync.ts',
    outputDir: 'sync',
    outputFile: 'index.js',
  },
  {
    name: 'preview',
    sourceFile: 'src/bin/github-actions/preview.ts',
    outputDir: 'preview',
    outputFile: 'index.js',
  },
];

function buildAction(config: ActionConfig): void {
  console.log(`🔨 Building ${config.name} action...`);

  try {
    // Ensure output directory exists
    if (!existsSync(config.outputDir)) {
      mkdirSync(config.outputDir, { recursive: true });
    }

    const sourcePath = join(process.cwd(), config.sourceFile);
    const outputPath = join(config.outputDir, config.outputFile);

    // Compile TypeScript to JavaScript using ncc via exec
    const nccCommand = [
      'npx ncc build',
      sourcePath,
      '-o',
      config.outputDir,
      '--minify',
      '--source-map',
      '--target es2020',
    ].join(' ');

    console.log(`Running: ${nccCommand}`);
    execSync(nccCommand, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    // Rename the output file to the desired name
    const defaultOutputPath = join(config.outputDir, 'index.js');
    if (defaultOutputPath !== outputPath) {
      execSync(`mv "${defaultOutputPath}" "${outputPath}"`, {
        stdio: 'inherit',
      });
    }

    console.log(`✅ Successfully built ${config.name} action to ${outputPath}`);
  } catch (error) {
    console.error(
      `❌ Failed to build ${config.name} action:`,
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

function buildAllActions(): void {
  console.log('🚀 Starting GitHub Actions build process...\n');

  try {
    for (const action of actions) {
      buildAction(action);
      console.log(''); // Add spacing between builds
    }

    console.log('🎉 All GitHub Actions built successfully!');
  } catch (error) {
    console.error(
      '💥 Build process failed:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run the build process if this script is executed directly
if (require.main === module) {
  buildAllActions();
}

export { buildAction, buildAllActions };
