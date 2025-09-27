---
id: github-actions
title: GitHub Actions
description: Use Mk Notes with GitHub Actions to automate markdown to Notion synchronization
---

# GitHub Actions

Mk Notes provides GitHub Actions that allow you to automate the synchronization of your markdown files to Notion directly from your GitHub workflows. This is perfect for automatically updating your Notion documentation whenever you push changes to your repository.

---

## Available Actions

Mk Notes offers two GitHub Actions:

- **`sync`** - Synchronizes markdown files or directories to a Notion page
- **`preview`** - Previews the synchronization result without actually syncing

---

## Sync Action

The sync action synchronizes your markdown files to a dedicated Notion page, maintaining the structure and formatting of your content.

### Usage

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Sync markdown to Notion
    uses: Myastr0/mk-notes/sync@v1
    with:
      input: './docs' # The path to the markdown file or directory to synchronize
      destination: 'https://notion.so/your-page-id'
      clean: 'true'
      notion-api-key: ${{ secrets.NOTION_API_KEY }}
```

### Inputs

| Input            | Description                                                                                                                                            | Required | Default |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------- |
| `input`          | The path to the markdown file or directory to synchronize                                                                                              | `true`   | -       |
| `destination`    | The Notion page URL where you want to synchronize your markdown files                                                                                  | `true`   | -       |
| `notion-api-key` | Your Notion secret token                                                                                                                               | `true`   | -       |
| `clean`          | Clean sync mode - WARNING: removes ALL existing content from the destination page before syncing, including any custom content not created by mk-notes | `false`  | `false` |

### Outputs

This action does not produce any outputs.

### Examples

#### Sync Documentation on Release

```yaml
name: Sync Docs to Notion

on:
  release:
    types: [published]

jobs:
  sync-docs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Sync documentation to Notion
        uses: Myastr0/mk-notes/sync@v1
        with:
          input: './docs'
          destination: ${{ secrets.NOTION_DOCS_PAGE_URL }}
          notion-api-key: ${{ secrets.NOTION_API_KEY }}
```

#### Sync on Push to Main Branch

```yaml
name: Auto-sync to Notion

on:
  push:
    branches: [main]
    paths: ['docs/**']

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Sync to Notion
        uses: Myastr0/mk-notes/sync@v1
        with:
          input: './docs'
          destination: ${{ secrets.NOTION_DOCS_PAGE_URL }}
          notion-api-key: ${{ secrets.NOTION_API_KEY }}
```

#### Clean Sync with Warning

```yaml
name: Clean Sync Documentation

on:
  workflow_dispatch:

jobs:
  clean-sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Clean sync to Notion
        uses: Myastr0/mk-notes/sync@v1
        with:
          input: './content'
          destination: ${{ secrets.NOTION_DOCS_PAGE_URL }}
          notion-api-key: ${{ secrets.NOTION_API_KEY }}
          clean: 'true'
```

---

## Preview Action

The preview action shows you what the synchronization result will look like without actually performing the sync. This is useful for verifying the structure before making changes.

### Usage

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Preview markdown synchronization
    uses: Myastr0/mk-notes/preview@v1
    with:
      input: './docs' # The path to the markdown file or directory to preview
      format: 'plainText' # The format of the preview ("plainText" or "json")
      output: './preview.txt' # Optional: path to save the preview
```

### Inputs

| Input    | Description                                               | Required | Default |
| -------- | --------------------------------------------------------- | -------- | ------- |
| `input`  | The path to the markdown file or directory to synchronize | `true`   | -       |
| `format` | The format of the preview ("plainText" or "json")         | `true`   | -       |
| `output` | The path to the output file                               | `false`  | -       |

### Outputs

| Output      | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `file-path` | The path to the output file (only set when output is specified) |

### Examples

#### Preview Before Sync

```yaml
name: Preview and Sync

on:
  pull_request:
    paths: ['docs/**']

jobs:
  preview-and-sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Preview synchronization
        uses: Myastr0/mk-notes/preview@v1
        with:
          input: './docs'
          format: 'plainText'
          output: './preview.txt'

      - name: Upload preview
        uses: actions/upload-artifact@v4
        with:
          name: sync-preview
          path: ./preview.txt

      - name: Sync to Notion
        if: github.event_name == 'push'
        uses: Myastr0/mk-notes/sync@v1
        with:
          input: './docs'
          destination: ${{ secrets.NOTION_DOCS_PAGE_URL }}
          notion-api-key: ${{ secrets.NOTION_API_KEY }}
```

#### Generate JSON Preview

```yaml
name: Generate JSON Preview

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  generate-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Generate JSON preview
        uses: Myastr0/mk-notes/preview@v1
        with:
          input: './docs'
          format: 'json'
          output: './docs-structure.json'

      - name: Upload JSON preview
        uses: actions/upload-artifact@v4
        with:
          name: docs-structure
          path: ./docs-structure.json
```

---

## Setting Up Secrets

To use the GitHub Actions, you'll need to set up the following secrets in your repository:

1. **`NOTION_API_KEY`** - Your Notion integration secret token
2. **`NOTION_DOCS_PAGE_URL`** - The URL of the Notion page where you want to sync your documentation

### How to Set Up Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the appropriate value

### Getting Your Notion API Key

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Give it a name and select the workspace
4. Copy the **Internal Integration Token**
5. Add it as `NOTION_API_KEY` in your GitHub secrets

### Getting Your Notion Page URL

1. Open the Notion page where you want to sync your documentation
2. Click **Share** → **Copy link**
3. Copy the URL and add it as `NOTION_DOCS_PAGE_URL` in your GitHub secrets

---

## Best Practices

### 1. Use Preview Before Sync

Always use the preview action before syncing to verify the structure:

```yaml
- name: Preview changes
  uses: Myastr0/mk-notes/preview@v1
  with:
    input: './docs'
    format: 'plainText'

- name: Sync to Notion
  if: github.ref == 'refs/heads/main'
  uses: Myastr0/mk-notes/sync@v1
  with:
    input: './docs'
    destination: ${{ secrets.NOTION_DOCS_PAGE_URL }}
    notion-api-key: ${{ secrets.NOTION_API_KEY }}
```

### 2. Use Clean Sync Carefully

The `clean: 'true'` option removes ALL existing content from the destination page. Use it only when:

- You're sure you want to replace all content
- The page is dedicated to mk-notes content
- You have backups of important content

### 3. Sync on Specific Paths

Only trigger syncs when documentation files change:

```yaml
on:
  push:
    branches: [main]
    paths: ['docs/**', '*.md']
```

### 4. Use Different Pages for Different Branches

Consider using different Notion pages for different branches:

```yaml
- name: Sync to Notion
  uses: Myastr0/mk-notes/sync@v1
  with:
    input: './docs'
    destination: ${{ github.ref == 'refs/heads/main' && secrets.NOTION_MAIN_DOCS_PAGE_URL || secrets.NOTION_DEV_DOCS_PAGE_URL }}
    notion-api-key: ${{ secrets.NOTION_API_KEY }}
```

---

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure your Notion integration has access to the target page
2. **Invalid API Key**: Verify your `NOTION_API_KEY` secret is correct
3. **Page Not Found**: Check that your `NOTION_DOCS_PAGE_URL` is valid and accessible
4. **Build Failures**: Ensure your repository has the necessary files and structure

### Debug Steps

1. Check the GitHub Actions logs for detailed error messages
2. Verify your secrets are set correctly
3. Test the sync locally first using the CLI
4. Use the preview action to verify the structure before syncing

For more help, check the [CLI Commands](../advanced-guides/cli-commands.md) documentation or open an issue on our [GitHub repository](https://github.com/Myastr0/mk-notes/issues).
