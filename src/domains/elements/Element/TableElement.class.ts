import { Element } from './Element.class';
import { ElementType } from './types';

export class TableElement extends Element {
  public rows: string[][];

  constructor({ rows }: { rows: string[][] }) {
    super(ElementType.Table);
    this.rows = rows;
  }
}
