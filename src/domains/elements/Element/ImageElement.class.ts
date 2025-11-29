import { Element } from './Element.class';
import { ElementType } from './types';

export class ImageElement extends Element {
  public base64?: string;
  public url?: string;
  public caption?: string;
  public name?: string;
  public creationDate?: Date;
  public lastUpdatedDate?: Date;
  public extension?: string;
  public filepath?: string;

  constructor({
    base64,
    url,
    name,
    creationDate,
    lastUpdatedDate,
    extension,
    caption,
    filepath,
  }: {
    base64?: string;
    url?: string;
    name?: string;
    creationDate?: Date;
    lastUpdatedDate?: Date;
    extension?: string;
    caption?: string;
    filepath?: string;
  }) {
    super(ElementType.Image);
    this.name = name;
    this.creationDate = creationDate;
    this.lastUpdatedDate = lastUpdatedDate;
    this.extension = extension;
    this.base64 = base64;
    this.url = url;
    this.caption = caption;
    this.filepath = filepath;
  }
}
