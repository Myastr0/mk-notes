import { Element } from './Element.class';
import { ElementType } from './types';

export class QuoteElement extends Element {
  public text: string;

  constructor({ id, text }: { id?: string; text: string }) {
    super({ id, type: ElementType.Quote });
    this.text = text;
  }

  public toContentString(): string {
    return `> ${this.text}`;
  }
}
