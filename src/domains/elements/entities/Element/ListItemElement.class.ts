import { RichTextElement } from '.';
import { Element } from './Element.class';
import { ElementType } from './types';

export class ListItemElement extends Element {
  public listType: 'ordered' | 'unordered';
  public text: RichTextElement;
  public children?: Element[];
  constructor({
    id,
    listType,
    text,
    children,
  }: {
    id?: string;
    listType: 'ordered' | 'unordered';
    text: RichTextElement;
    children?: Element[];
  }) {
    super({ id, type: ElementType.ListItem });
    this.listType = listType;
    this.text = text;
    this.children = children;
  }

  public toContentString(): string {
    let content = '';
    if (this.listType === 'ordered') {
      content = `1. ${this.text.map((element) => element.toContentString()).join('')}`;
    } else {
      content = `- ${this.text.map((element) => element.toContentString()).join('')}`;
    }

    if (this.children) {
      content += `\n${this.children.map((element) => element.toContentString()).join('')}`;
    }
    return content;
  }
}
