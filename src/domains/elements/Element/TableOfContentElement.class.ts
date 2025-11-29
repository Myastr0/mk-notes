import { Element } from './Element.class';
import { ElementType } from './types';

export class TableOfContentsElement extends Element {
  constructor() {
    super(ElementType.TableOfContents);
  }
}
