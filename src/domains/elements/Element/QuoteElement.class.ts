import { Element } from './Element.class';
import { ElementType } from './types';

export class QuoteElement extends Element {
  public text: string;

  constructor({ text }: { text: string }) {
    super(ElementType.Quote);
    this.text = text;
  }
}
