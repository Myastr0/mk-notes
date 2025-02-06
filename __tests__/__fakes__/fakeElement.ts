import { Element, ElementType, PageElement } from '@/domains/elements/Element';

import { SupportedEmoji } from '../../src';

export class FakeElement implements Element {
  id: string;
  name: string;
  type: ElementType;
  constructor(id: string, name: string) {
    this.type = 'fake' as ElementType;

    this.id = id;
    this.name = name;
  }

  withType(type: ElementType): FakeElement {
    this.type = type;
    return this;
  }

  withName(name: string): FakeElement {
    this.name = name;
    return this;
  }
}

export const aFakeElement = (): FakeElement => {
  return new FakeElement('id', 'name');
};

export class FakePageElement extends PageElement {
  constructor({
    title,
    icon,
    content = [],
  }: {
    title: string;
    icon?: SupportedEmoji;
    content: Element[];
  }) {
    super({ title, icon, content });
    this.type = 'fake' as ElementType;
  }

  withIcon(icon: SupportedEmoji): FakePageElement {
    this.icon = icon;
    return this;
  }

  withTitle(title: string): FakePageElement {
    this.title = title;
    return this;
  }
}

export const aFakePageElement = (): FakePageElement => {
  return new FakePageElement({ title: 'title', content: [] });
};
