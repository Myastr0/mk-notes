import { Element } from './Element';

export interface ElementConverterRepository<E extends Element, S> {
  convertToElement(u: S): E;
  convertFromElement?: (e: E) => S;
}
