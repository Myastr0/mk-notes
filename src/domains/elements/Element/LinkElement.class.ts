import { Element } from './Element.class';
import { ElementType } from './types';

export class LinkElement extends Element {
  public url: string;
  public text: string;
  public caption?: string;

  constructor({
    url,
    text,
    caption,
  }: {
    url: string;
    text: string;
    caption?: string;
  }) {
    super(ElementType.Link);
    this.url = url;
    this.text = text;
    this.caption = caption;
  }
}
