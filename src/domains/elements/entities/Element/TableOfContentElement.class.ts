import { Element } from './Element.class';
import { ElementType } from './types';

export class TableOfContentsElement extends Element {
  constructor({ id }: { id?: string } = { id: undefined }) {
    super({ id, type: ElementType.TableOfContents });
  }

  public toContentString(): string {
    return '';
  }
}
