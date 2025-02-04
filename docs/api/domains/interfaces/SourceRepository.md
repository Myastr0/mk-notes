[**@mk-notes/cli**](../../README.md)

***

[@mk-notes/cli](../../README.md) / [domains](../README.md) / SourceRepository

# Interface: SourceRepository\<T\>

Defined in: [domains/synchronization/source.repository.ts:13](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/synchronization/source.repository.ts#L13)

## Type Parameters

• **T**

## Properties

### getFile()

> **getFile**: (`args`) => `Promise`\<[`File`](File.md)\>

Defined in: [domains/synchronization/source.repository.ts:15](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/synchronization/source.repository.ts#L15)

#### Parameters

##### args

`T`

#### Returns

`Promise`\<[`File`](File.md)\>

***

### getFilePathList()

> **getFilePathList**: (`args`) => `Promise`\<`string`[]\>

Defined in: [domains/synchronization/source.repository.ts:14](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/synchronization/source.repository.ts#L14)

#### Parameters

##### args

`T`

#### Returns

`Promise`\<`string`[]\>

***

### sourceIsAccessible()

> **sourceIsAccessible**: (`args`) => `Promise`\<`boolean`\>

Defined in: [domains/synchronization/source.repository.ts:16](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/synchronization/source.repository.ts#L16)

#### Parameters

##### args

`T`

#### Returns

`Promise`\<`boolean`\>
