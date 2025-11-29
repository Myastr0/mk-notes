import { RichTextElement } from '.';
import { Element } from './Element.class';
import { ElementType } from './types';

export class ListItemElement extends Element {
  public listType: 'ordered' | 'unordered';
  public text: RichTextElement;
  public children?: Element[];
  constructor({
    listType,
    text,
    children,
  }: {
    listType: 'ordered' | 'unordered';
    text: RichTextElement;
    children?: Element[];
  }) {
    super(ElementType.ListItem);
    this.listType = listType;
    this.text = text;
    this.children = children;
  }
}
