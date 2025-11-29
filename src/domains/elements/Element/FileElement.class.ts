import { Element } from './Element.class';
import { ElementType } from './types';

/**
 * Element that represents a file in the system
 */
export class FileElement extends Element {
  public content: string;
  public name?: string;
  public creationDate?: Date;
  public lastUpdatedDate?: Date;
  public extension?: string;

  constructor({
    content,
    name,
    creationDate,
    lastUpdatedDate,
    extension,
  }: {
    content: string;
    name?: string;
    creationDate?: Date;
    lastUpdatedDate?: Date;
    extension?: string;
  }) {
    super(ElementType.File);
    this.content = content;
    this.name = name;
    this.creationDate = creationDate;
    this.lastUpdatedDate = lastUpdatedDate;
    this.extension = extension;
  }
}
