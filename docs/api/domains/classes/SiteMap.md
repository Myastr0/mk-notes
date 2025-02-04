[**@mk-notes/cli**](../../README.md)

***

[@mk-notes/cli](../../README.md) / [domains](../README.md) / SiteMap

# Class: SiteMap

Defined in: [domains/sitemap/SiteMap.ts:7](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/SiteMap.ts#L7)

## Constructors

### new SiteMap()

> **new SiteMap**(): [`SiteMap`](SiteMap.md)

Defined in: [domains/sitemap/SiteMap.ts:10](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/SiteMap.ts#L10)

#### Returns

[`SiteMap`](SiteMap.md)

## Accessors

### root

#### Get Signature

> **get** **root**(): [`TreeNode`](TreeNode.md)

Defined in: [domains/sitemap/SiteMap.ts:141](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/SiteMap.ts#L141)

##### Returns

[`TreeNode`](TreeNode.md)

## Methods

### \_updateTree()

> **\_updateTree**(): `void`

Defined in: [domains/sitemap/SiteMap.ts:125](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/SiteMap.ts#L125)

Traverse the tree and update nodes based on the specified rules

#### Returns

`void`

***

### buildFromConfig()

> **buildFromConfig**(`config`): `void`

Defined in: [domains/sitemap/SiteMap.ts:136](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/SiteMap.ts#L136)

TODO: Implement mkdocs.yaml sitemap parsing

Parses the mkdocs.yaml content and adds nodes to the sitemap

#### Parameters

##### config

`Record`\<`string`, `unknown`\>

Parsed YAML content from mkdocs.yaml

#### Returns

`void`

***

### toJSON()

> **toJSON**(): `object`

Defined in: [domains/sitemap/SiteMap.ts:145](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/SiteMap.ts#L145)

#### Returns

`object`

##### root

> **root**: `Record`\<`string`, `unknown`\>

***

### buildFromFilePaths()

> `static` **buildFromFilePaths**(`filepaths`): [`SiteMap`](SiteMap.md)

Defined in: [domains/sitemap/SiteMap.ts:24](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/SiteMap.ts#L24)

Builds the sitemap tree from a list of file paths

#### Parameters

##### filepaths

`string`[]

Array of file paths

#### Returns

[`SiteMap`](SiteMap.md)

***

### fromJSON()

> `static` **fromJSON**(`data`): [`SiteMap`](SiteMap.md)

Defined in: [domains/sitemap/SiteMap.ts:155](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/SiteMap.ts#L155)

Creates a new SiteMap instance from a JSON object

#### Parameters

##### data

`Record`\<`string`, `unknown`\>

JSON object containing the sitemap structure

#### Returns

[`SiteMap`](SiteMap.md)
