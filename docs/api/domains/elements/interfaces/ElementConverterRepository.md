[**@mk-notes/cli**](../../../README.md)

***

[@mk-notes/cli](../../../README.md) / [domains/elements](../README.md) / ElementConverterRepository

# Interface: ElementConverterRepository\<S, E\>

Defined in: [domains/elements/converter.repository.ts:3](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/converter.repository.ts#L3)

## Type Parameters

• **S**

• **E** *extends* [`Element`](../classes/Element.md)

## Properties

### convertFromElement()?

> `optional` **convertFromElement**: (`e`) => `Promise`\<`S`\>

Defined in: [domains/elements/converter.repository.ts:5](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/converter.repository.ts#L5)

#### Parameters

##### e

`E`

#### Returns

`Promise`\<`S`\>

## Methods

### convertToElement()

> **convertToElement**(`u`): `Promise`\<`E`\>

Defined in: [domains/elements/converter.repository.ts:4](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/converter.repository.ts#L4)

#### Parameters

##### u

`S`

#### Returns

`Promise`\<`E`\>
