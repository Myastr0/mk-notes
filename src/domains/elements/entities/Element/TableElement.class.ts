import { Element } from './Element.class';
import { ElementType } from './types';

export class TableElement extends Element {
  public rows: string[][];

  constructor({ id, rows }: { id?: string; rows: string[][] }) {
    super({ id, type: ElementType.Table });

    this.rows = rows;
  }

  public toContentString(): string {
    return this.rows.map((row) => row.join(' | ')).join('\n');
  }
}
