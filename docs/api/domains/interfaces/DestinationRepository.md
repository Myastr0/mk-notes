[**@mk-notes/cli**](../../README.md)

***

[@mk-notes/cli](../../README.md) / [domains](../README.md) / DestinationRepository

# Interface: DestinationRepository\<T\>

Defined in: [domains/synchronization/destination.repository.ts:9](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/synchronization/destination.repository.ts#L9)

## Type Parameters

• **T** *extends* [`Page`](Page.md)

## Properties

### createPage()

> **createPage**: (`__namedParameters`) => `Promise`\<`T`\>

Defined in: [domains/synchronization/destination.repository.ts:10](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/synchronization/destination.repository.ts#L10)

#### Parameters

##### \_\_namedParameters

###### pageElement

[`PageElement`](../elements/classes/PageElement.md)

###### parentPageId

`string`

#### Returns

`Promise`\<`T`\>

***

### destinationIsAccessible()

> **destinationIsAccessible**: (`__namedParameters`) => `Promise`\<`boolean`\>

Defined in: [domains/synchronization/destination.repository.ts:24](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/synchronization/destination.repository.ts#L24)

#### Parameters

##### \_\_namedParameters

###### parentPageId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### updatePage()

> **updatePage**: (`__namedParameters`) => `Promise`\<`T`\>

Defined in: [domains/synchronization/destination.repository.ts:17](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/synchronization/destination.repository.ts#L17)

#### Parameters

##### \_\_namedParameters

###### pageElement

[`PageElement`](../elements/classes/PageElement.md)

###### pageId

`string`

#### Returns

`Promise`\<`T`\>
