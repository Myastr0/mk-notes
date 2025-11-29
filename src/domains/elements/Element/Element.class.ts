import { ElementType } from './types';

export class Element {
  public type: ElementType;

  constructor(type: ElementType) {
    this.type = type;
  }
}
