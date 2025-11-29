import { Element } from './Element.class';
import { ElementType } from './types';

export class DividerElement extends Element {
  constructor() {
    super(ElementType.Divider);
  }
}
