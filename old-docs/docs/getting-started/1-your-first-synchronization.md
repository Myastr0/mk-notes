---
id: your-first-synchronization
title: Your first synchronization
description: Tutorial to make your first synchronization with Mk Notes
---

# Your first synchronization

In this tutorial, you will learn how to synchronize your markdown files in a Notion page with Mk Notes.

---

## Requirements

- A **Notion Integration** with read-write access on your Notion page
  :::tip
  Read the official [Notion guide](https://developers.notion.com/docs/authorization) to create and setup a Notion Integration on your workspace
  :::

## Step-by-step guide ☝️

### Step 1: Preview the synchronization result

Before starting the synchronization, you can preview the result of the synchronization by running the following command:

```bash
  mk-notes preview-sync --input <path-to-your-markdown-file-or-directory>
```

You will see the Notion page architecture that will be generated based on your markdown files.

### Step 2: Synchronize your markdown files

Launch the following command:

```bash
  mk-notes sync \
    --input <path-to-your-markdown-file-or-directory> \
    --destination <notion-page-url> \
    --notion-api-key <your-notion-secret>
```

- `--input` : The path to your markdown file or directory containing markdown files.
- `--destination` : The Notion page URL where you want to synchronize your markdown files.
- `--notion-api-key` : Your Notion secret token.

:::warning
Please note that you can only synchronize markdown files to **Notion Pages**. Notion Databases are not supported for now.
:::

# Going further

Mk Notes allows you to customize the created Notion pages directly from your markdown files using `frontmatter`
