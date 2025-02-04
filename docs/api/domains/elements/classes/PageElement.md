[**@mk-notes/cli**](../../../README.md)

***

[@mk-notes/cli](../../../README.md) / [domains/elements](../README.md) / PageElement

# Class: PageElement

Defined in: [domains/elements/Element.ts:31](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L31)

Element that represents the concept of page (in knowledge management systems)

## Extends

- [`Element`](Element.md)

## Constructors

### new PageElement()

> **new PageElement**(`__namedParameters`): [`PageElement`](PageElement.md)

Defined in: [domains/elements/Element.ts:36](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L36)

#### Parameters

##### \_\_namedParameters

###### content

[`Element`](Element.md)[] = `[]`

###### icon

[`SupportedEmoji`](../type-aliases/SupportedEmoji.md)

###### title

`string`

#### Returns

[`PageElement`](PageElement.md)

#### Overrides

[`Element`](Element.md).[`constructor`](Element.md#constructors)

## Properties

### content

> `readonly` **content**: [`Element`](Element.md)[]

Defined in: [domains/elements/Element.ts:34](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L34)

***

### title

> `readonly` **title**: `string`

Defined in: [domains/elements/Element.ts:32](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L32)

***

### type

> **type**: [`ElementType`](../enumerations/ElementType.md)

Defined in: [domains/elements/Element.ts:21](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L21)

#### Inherited from

[`Element`](Element.md).[`type`](Element.md#type-1)

## Methods

### addElementToBeginning()

> **addElementToBeginning**(`element`): `void`

Defined in: [domains/elements/Element.ts:55](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L55)

#### Parameters

##### element

[`Element`](Element.md)

#### Returns

`void`

***

### addElementToEnd()

> **addElementToEnd**(`element`): `void`

Defined in: [domains/elements/Element.ts:59](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L59)

#### Parameters

##### element

[`Element`](Element.md)

#### Returns

`void`

***

### getIcon()

> **getIcon**(): `undefined` \| [`SupportedEmoji`](../type-aliases/SupportedEmoji.md)

Defined in: [domains/elements/Element.ts:51](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L51)

#### Returns

`undefined` \| [`SupportedEmoji`](../type-aliases/SupportedEmoji.md)
