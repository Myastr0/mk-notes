import { Element } from './Element.class';
import { ElementType } from './types';

export class HtmlElement extends Element {
  public html: string;

  constructor({ html }: { html: string }) {
    super(ElementType.Html);
    this.html = html;
  }
}
