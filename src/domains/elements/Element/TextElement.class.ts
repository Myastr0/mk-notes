import { Element } from './Element.class';
import { EquationElement } from './EquationElement.class';
import { ImageElement } from './ImageElement.class';
import { LinkElement } from './LinkElement.class';
import { ListItemElement } from './ListItemElement.class';
import { TextElementStyles } from './TextElement.types';
import { ElementType } from './types';

export type RichTextElement = (
  | TextElement
  | LinkElement
  | ImageElement
  | EquationElement
  | ListItemElement
)[];

export enum TextElementLevel {
  Heading1 = 'heading_1',
  Heading2 = 'heading_2',
  Heading3 = 'heading_3',
  Heading4 = 'heading_4',
  Heading5 = 'heading_5',
  Heading6 = 'heading_6',
  Paragraph = 'paragraph',
}

export enum TextElementStyle {
  Italic = 'italic',
  Bold = 'bold',
  Strikethrough = 'strikethrough',
  Underline = 'underline',
}

export class TextElement extends Element {
  public text: string | RichTextElement;
  public level: TextElementLevel;
  public styles: TextElementStyles = {
    italic: false,
    bold: false,
    strikethrough: false,
    underline: false,
    code: false,
  };

  constructor({
    text,
    level = TextElementLevel.Paragraph,
    styles,
  }: {
    text: string | RichTextElement;
    level?: TextElementLevel;
    styles?: {
      italic?: boolean;
      bold?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
      code?: boolean;
    };
  }) {
    super(ElementType.Text);
    this.text = text;
    this.level = level;
    this.styles.bold = styles?.bold || false;
    this.styles.italic = styles?.italic || false;
    this.styles.strikethrough = styles?.strikethrough || false;
    this.styles.underline = styles?.underline || false;
    this.styles.code = styles?.code || false;
  }
}
