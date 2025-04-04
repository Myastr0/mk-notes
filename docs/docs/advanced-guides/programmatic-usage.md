---
title: Programmatic usage
id: programmatic-usage
description: Reference guide to use Mk Notes programmatically
---

# Programmatic usage

Mk Notes can be used programmatically in your Javascript/Typescript projects.

---

The library exposes a MkClient class that allows you to use the main functionalities of Mk Notes directly inside you code.

```ts
import { MkClient } from 'mk-notes';

const client = new MkClient({
  notionApiToken: 'YOUR_NOTION_SECRET',
});

client.previewSynchronization({ inputPath: './notes/' }).then(console.log);
```

See the [API documentation](/docs/api) for more information on the methods available.
