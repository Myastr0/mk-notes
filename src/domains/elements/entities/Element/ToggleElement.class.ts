import { Element } from './Element.class';
import { ElementType } from './types';

export class ToggleElement extends Element {
  public title: string;
  public children: Element[];

  constructor({
    id,
    title,
    children,
  }: {
    id?: string;
    title: string;
    children: Element[];
  }) {
    super({ id, type: ElementType.Toggle });
    this.title = title;
    this.children = children;
  }

  public toContentString(): string {
    const { title } = this;
    return `[${title}](${this.children.map((element) => element.toContentString()).join('')})`;
  }
}
