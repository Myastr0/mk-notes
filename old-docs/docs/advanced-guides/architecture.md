---
id: architecture
title: Architecture
---

# Architecture

This document outlines the strategy to build the notion page architecture based on your directory organization

---

## Introduction

MK Notes uses a sitemap strategy to organize your markdown files into a structured hierarchy that maps cleanly to Notion pages.
This approach ensures your documentation maintains a logical structure while being easy to navigate.

## How It Works

The sitemap system reads your markdown files and creates a tree structure that represents your documentation hierarchy. This structure is then used to generate a matching hierarchy in Notion.

### Organization Rules

MK Notes follows these rules to create a clean and intuitive structure:

1. **Index Files as Section Headers**

   - When a directory contains an `index.md` file, it becomes the main content for that section
   - Other files in the directory are organized as subsections
   - This lets you create natural section divisions with introductory content

2. **Automatic Main Content Selection**

   - For directories without an index file, the first markdown file becomes the section's main content
   - This ensures every section has associated content without requiring explicit configuration

3. **Smart Directory Handling**
   - Single-file directories are automatically flattened
   - This prevents unnecessary nesting and keeps your navigation clean

### Example Structure

Consider this file organization:

```
docs/
├── getting-started/
│   ├── index.md
│   ├── installation.md
│   └── configuration.md
├── guides/
│   ├── basic-usage.md
│   └── advanced-features/
│       └── customization.md
└── api-reference.md
```

MK Notes will create this logical structure:

```txt
- **Getting Started** (from index.md)
  - Installation
  - Configuration
- **Guides** (using basic-usage.md as main content)
  - Customization
- **API Reference**
```

This structure is then mirrored in your Notion workspace, maintaining the same hierarchy and relationships between pages.

## Benefits

This approach offers several advantages:

1. **Automatic Organization**

   - No need to manually specify page relationships
   - Directory structure naturally defines content hierarchy

2. **Flexible Structure**

   - Support for both flat and nested documentation
   - Easy to reorganize by moving files and directories

3. **Clean Navigation**

   - Intuitive hierarchy that matches your file structure
   - Automatic cleanup of unnecessary nesting levels

4. **Easy Maintenance**
   - Add new content by simply adding markdown files
   - Reorganize by moving files - the structure updates automatically

For technical details about the implementation, please refer to our [Contributing Guide](../contributing/implementation-details.md).
