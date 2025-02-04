import { Element } from './Element';

export interface ElementConverterRepository<S, E extends Element> {
  convertToElement(u: S): Promise<E>;
  convertFromElement?: (e: E) => Promise<S>;
}
