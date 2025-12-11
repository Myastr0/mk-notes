import { Element } from './Element.class';
import { ElementType } from './types';

export class DividerElement extends Element {
  constructor({ id }: { id?: string } = { id: undefined }) {
    super({ id, type: ElementType.Divider });
  }

  public toContentString(): string {
    return '------';
  }
}
