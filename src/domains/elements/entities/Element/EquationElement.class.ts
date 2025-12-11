import { Element } from './Element.class';
import { TextElementStyles } from './TextElement.types';
import { ElementType } from './types';

export class EquationElement extends Element {
  public equation: string;
  public styles: TextElementStyles = {
    italic: false,
    bold: false,
    strikethrough: false,
    underline: false,
    code: false,
  };

  constructor({
    id,
    equation,
    styles,
  }: {
    id?: string;
    equation: string;
    styles?: {
      italic?: boolean;
      bold?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
      code?: boolean;
    };
  }) {
    super({ id, type: ElementType.Equation });
    this.equation = equation;
    this.styles.bold = styles?.bold || false;
    this.styles.italic = styles?.italic || false;
    this.styles.strikethrough = styles?.strikethrough || false;
    this.styles.underline = styles?.underline || false;
    this.styles.code = styles?.code || false;
  }

  public toContentString(): string {
    let { equation } = this;

    if (this.styles.italic) {
      equation = `_${equation}_`;
    }
    if (this.styles.strikethrough) {
      equation = `~~${equation}~~`;
    }
    if (this.styles.underline) {
      equation = `__${equation}__`;
    }
    return equation;
  }
}
