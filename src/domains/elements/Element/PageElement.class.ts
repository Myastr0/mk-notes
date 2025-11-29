import { SupportedEmoji } from '../types';
import { Element } from './Element.class';
import { ElementType } from './types';

export type PageElementPropertyValue =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | boolean[]
  | null
  | undefined;

export type PageElementProperties = {
  name: string;
  value: PageElementPropertyValue;
};

/**
 * Element that represents the concept of page (in knowledge management systems)
 */
export class PageElement extends Element {
  public mkNotesInternalId?: string;
  public title: string;
  public icon?: SupportedEmoji;
  public content: Element[];
  public properties?: PageElementProperties[];

  constructor({
    mkNotesInternalId,
    title,
    icon,
    content = [],
    properties,
  }: {
    mkNotesInternalId?: string;
    title: string;
    icon?: SupportedEmoji;
    content: Element[];
    properties?: PageElementProperties[];
  }) {
    super(ElementType.Page);
    this.mkNotesInternalId = mkNotesInternalId;
    this.title = title;
    this.icon = icon;
    this.content = content;
    this.properties = properties;
  }

  public getIcon(): SupportedEmoji | undefined {
    return this.icon;
  }

  public addElementToBeginning(element: Element): void {
    this.content.unshift(element);
  }

  public addElementToEnd(element: Element): void {
    this.content.push(element);
  }
}
