import { ElementType } from './types';

export class Element {
  public id?: string;
  public type: ElementType;

  constructor({ id, type }: { id?: string; type: ElementType }) {
    this.id = id;
    this.type = type;
  }

  public toContentString(): string {
    throw new Error('toContentString must be implemented by the subclass');
  }
}
