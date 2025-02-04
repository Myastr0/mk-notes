[**@mk-notes/cli**](../../../README.md)

***

[@mk-notes/cli](../../../README.md) / [domains/elements](../README.md) / CalloutElement

# Class: CalloutElement

Defined in: [domains/elements/Element.ts:230](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L230)

## Extends

- [`Element`](Element.md)

## Constructors

### new CalloutElement()

> **new CalloutElement**(`__namedParameters`): [`CalloutElement`](CalloutElement.md)

Defined in: [domains/elements/Element.ts:239](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L239)

#### Parameters

##### \_\_namedParameters

###### icon

[`SupportedEmoji`](../type-aliases/SupportedEmoji.md)

###### text

`string`

#### Returns

[`CalloutElement`](CalloutElement.md)

#### Overrides

[`Element`](Element.md).[`constructor`](Element.md#constructors)

## Properties

### text

> **text**: `string`

Defined in: [domains/elements/Element.ts:231](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L231)

***

### type

> **type**: [`ElementType`](../enumerations/ElementType.md)

Defined in: [domains/elements/Element.ts:21](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L21)

#### Inherited from

[`Element`](Element.md).[`type`](Element.md#type-1)

## Methods

### getIcon()

> **getIcon**(): `undefined` \| [`SupportedEmoji`](../type-aliases/SupportedEmoji.md)

Defined in: [domains/elements/Element.ts:283](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L283)

#### Returns

`undefined` \| [`SupportedEmoji`](../type-aliases/SupportedEmoji.md)

***

### isSpecialCalloutText()

> `static` **isSpecialCalloutText**(`text`): `boolean`

Defined in: [domains/elements/Element.ts:235](https://github.com/Myastr0/mk-notes/blob/184ba57922923e2636b5be8eb72e467e76933ed9/src/domains/elements/Element.ts#L235)

#### Parameters

##### text

`string`

#### Returns

`boolean`
