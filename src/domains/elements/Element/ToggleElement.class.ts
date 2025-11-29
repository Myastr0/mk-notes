import { Element } from './Element.class';
import { ElementType } from './types';

export class ToggleElement extends Element {
  public title: string;
  public children: Element[];

  constructor({ title, children }: { title: string; children: Element[] }) {
    super(ElementType.Toggle);
    this.title = title;
    this.children = children;
  }
}
