import { Element } from './Element.class';
import { ElementType } from './types';

export class LinkElement extends Element {
  public url: string;
  public text: string;
  public caption?: string;
  public filepath?: string;

  constructor({
    id,
    url,
    text,
    caption,
    filepath,
  }: {
    id?: string;
    url: string;
    text: string;
    caption?: string;
    filepath?: string;
  }) {
    super({ id, type: ElementType.Link });
    this.url = url;
    this.text = text;
    this.caption = caption;
    this.filepath = filepath;
  }

  public toContentString(): string {
    return `[${this.text}](${this.url})`;
  }
}
