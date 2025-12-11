import { File } from '@/domains/synchronization';

import { SupportedEmoji } from '../../types';
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

export interface PageElementProperties {
  name: string;
  value: PageElementPropertyValue;
}

/**
 * Element that represents the concept of page (in knowledge management systems)
 */
export class PageElement extends Element {
  public title: string;
  public icon?: SupportedEmoji;
  public content: Element[];
  public properties?: PageElementProperties[];
  public source?: File;

  constructor({
    id,
    title,
    icon,
    content = [],
    properties,
    source,
  }: {
    id?: string;
    title: string;
    icon?: SupportedEmoji;
    content: Element[];
    properties?: PageElementProperties[];
    source?: File;
  }) {
    super({ id, type: ElementType.Page });
    this.title = title;
    this.icon = icon;
    this.content = content;
    this.properties = properties;
    this.source = source;
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
