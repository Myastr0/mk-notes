import { Element } from '../entities/Element';

export interface ElementConverterRepository<E extends Element, S> {
  convertToElement(u: S): E;
  convertFromElement(e: E): Promise<S> | S;
}
