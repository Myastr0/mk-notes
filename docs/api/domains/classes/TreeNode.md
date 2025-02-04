[**@mk-notes/cli**](../../README.md)

***

[@mk-notes/cli](../../README.md) / [domains](../README.md) / TreeNode

# Class: TreeNode

Defined in: [domains/sitemap/TreeNode.ts:1](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L1)

## Constructors

### new TreeNode()

> **new TreeNode**(`__namedParameters`): [`TreeNode`](TreeNode.md)

Defined in: [domains/sitemap/TreeNode.ts:8](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L8)

#### Parameters

##### \_\_namedParameters

###### children

[`TreeNode`](TreeNode.md)[] = `[]`

###### filepath

`string`

###### id

`string`

###### name

`string`

###### parent

`null` \| [`TreeNode`](TreeNode.md) = `null`

#### Returns

[`TreeNode`](TreeNode.md)

## Properties

### children

> **children**: [`TreeNode`](TreeNode.md)[]

Defined in: [domains/sitemap/TreeNode.ts:5](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L5)

***

### filepath

> **filepath**: `string`

Defined in: [domains/sitemap/TreeNode.ts:4](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L4)

***

### id

> **id**: `string`

Defined in: [domains/sitemap/TreeNode.ts:2](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L2)

***

### name

> **name**: `string`

Defined in: [domains/sitemap/TreeNode.ts:3](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L3)

***

### parent

> **parent**: `null` \| [`TreeNode`](TreeNode.md)

Defined in: [domains/sitemap/TreeNode.ts:6](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L6)

## Methods

### toJSON()

> **toJSON**(): `Record`\<`string`, `unknown`\>

Defined in: [domains/sitemap/TreeNode.ts:33](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L33)

#### Returns

`Record`\<`string`, `unknown`\>

***

### fromJSON()

> `static` **fromJSON**(`json`, `parent`): [`TreeNode`](TreeNode.md)

Defined in: [domains/sitemap/TreeNode.ts:42](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/sitemap/TreeNode.ts#L42)

#### Parameters

##### json

`Record`\<`string`, `unknown`\>

##### parent

`null` | [`TreeNode`](TreeNode.md)

#### Returns

[`TreeNode`](TreeNode.md)
