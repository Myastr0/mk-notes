---
id: cli-commands
title: CLI Commands
---

# CLI Commands

MK Notes provides two main commands to help you manage your markdown to Notion synchronization:

---

## `sync`

The `sync` command synchronizes markdown files to a Notion page. You can sync either a single markdown file or an entire directory of markdown files, creating a matching page hierarchy for directories.

### Usage

```bash
mk-notes sync -i <path> -d <notionPageUrl> -k <notionApiKey>
```

### Required Options

- `-i, --input <path>`: Path to a markdown file or directory containing your markdown files
- `-d, --destination <notionPageUrl>`: URL of the parent Notion page where content will be synchronized
- `-k, --notion-api-key <notionApiKey>`: Your Notion API key for authentication

### Examples

#### Syncing a Directory

```bash
mk-notes sync \
  --input ./my-docs \
  --destination https://notion.so/myworkspace/doc-123456 \
  --notion-api-key secret_abc123...
```

This command will:

1. Read all markdown files in the `./my-docs` directory
2. Create a matching page hierarchy in Notion
3. Convert and sync the content to your specified Notion page
4. Display a success message with the Notion page URL when complete

#### Syncing a Single File

```bash
mk-notes sync \
  --input ./my-docs/README.md \
  --destination https://notion.so/myworkspace/doc-123456 \
  --notion-api-key secret_abc123...
```

This command will:

1. Read the single markdown file `./my-docs/README.md`
2. Create a single Notion page with the file content
3. Convert and sync the content to your specified Notion page
4. Display a success message with the Notion page URL when complete

## `preview-sync`

The `preview-sync` command lets you preview how your markdown files will be organized in Notion before actually performing the synchronization. This is useful for verifying the structure before making any changes.

### Usage

```bash
mk-notes preview-sync -i <path> [options]
```

### Required Option

- `-i, --input <path>`: Path to a markdown file or directory containing your markdown files

### Optional Options

- `-f, --format <format>`: Output format for the preview
  - `plainText` (default): Shows a tree-like structure
  - `json`: Outputs the structure in JSON format
- `-o, --output <output>`: Save the preview to a file instead of displaying it in the terminal

### Examples

1. Basic preview with default format:

```bash
mk-notes preview-sync --input ./my-docs
```

Output example for directory:

```
├─  (Your parent Notion Page)
│   ├─ getting-started.md
│   ├─ guides/
│   │   ├─ installation.md
│   │   ├─ configuration.md
│   ├─ api/
│   │   ├─ endpoints.md
│   │   ├─ authentication.md
```

Output example for single file:

```
├─  (Your parent Notion Page)
│   ├─ README.md
```

2. Preview in JSON format:

```bash
mk-notes preview-sync --input ./my-docs --format json
```

3. Save preview to a file:

```bash
mk-notes preview-sync --input ./my-docs --output preview.txt
```

4. Preview a single file:

```bash
mk-notes preview-sync --input ./my-docs/README.md
```

## Single File vs Directory Synchronization

Mk Notes automatically detects whether your input path is a single markdown file or a directory and handles each case appropriately:

### Single File Synchronization

- **Input**: A path to a single `.md` file
- **Behavior**: Creates a single Notion page with the file content
- **Use case**: When you want to sync just one specific document
- **Example**: `mk-notes sync -i ./docs/README.md -d <notion-url> -k <api-key>`

### Directory Synchronization

- **Input**: A path to a directory containing markdown files
- **Behavior**: Creates a hierarchical structure in Notion matching your directory structure
- **Use case**: When you want to sync an entire documentation project
- **Example**: `mk-notes sync -i ./docs -d <notion-url> -k <api-key>`

### Error Handling

- If you provide a non-markdown file, Mk Notes will show an error message
- If you provide a path that doesn't exist, you'll get a clear error message
- Only `.md` files are supported for synchronization

## Tips for Using CLI Commands

1. **Directory Structure**

   - Organize your markdown files in a logical hierarchy
   - Use directories to create sections and subsections
   - Consider using `index.md` files for section introductions

2. **Preview First**

   - Always use `preview-sync` before running the actual sync
   - Verify the structure matches your expectations
   - Make adjustments to your file organization if needed

3. **Notion API Key**

   - Keep your API key secure
   - Consider using environment variables for the API key
   - Make sure your API key has the necessary permissions

4. **Regular Backups**
   - Consider backing up your Notion pages before large syncs
   - Use `preview-sync` to verify changes before updating existing content

For more details about how MK Notes organizes your content, see the [Architecture](./architecture.md) documentation.
