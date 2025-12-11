import { Element } from './Element.class';
import { ElementType } from './types';

export class HtmlElement extends Element {
  public html: string;

  constructor({ id, html }: { id?: string; html: string }) {
    super({ id, type: ElementType.Html });
    this.html = html;
  }

  public toContentString(): string {
    return this.html;
  }
}
