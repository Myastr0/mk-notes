---
id: styling-notion-page
title: Styling Notion Page
description: How to guide to customize a Notion page
---

# Styling your Notion Page

This document explains how to customize your Notion Page directly from your markdown files

---

## Introduction

Mk Notes relies on `frontmatter` to be able to add metadata on markdown files.

```markdown
# Beggining of your markdown file

---

title: The notion page title
icon: 💡

---
```

_A frontmatter metadata config_

## Compatible properties :

Here's the Mk Notes supported properties to customize your Notion Page

### `title`

- Type: `string`

_optional_

This property allows you to specify a Notion page title.
If you do not provide this property, Mk Notes will relies on the name of the file.

```markdown
title: <string>
```

### `icon`

- Type: `string`

_optional_

This property allows you to set an icon to your Notion Page.

```markdown
icon: <emoji-unicode>
```

:::warning

Unfortunately, at the moment, Notion API does not support custom image upload. Only general emojis are available.

:::
