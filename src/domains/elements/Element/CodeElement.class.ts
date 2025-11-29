import { Element } from './Element.class';
import { ElementType } from './types';

export enum ElementCodeLanguage {
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Python = 'python',
  Java = 'java',
  CSharp = 'csharp',
  CPlusPlus = 'c++',
  Go = 'go',
  Ruby = 'ruby',
  Swift = 'swift',
  Kotlin = 'kotlin',
  Rust = 'rust',
  Shell = 'shell',
  Scala = 'scala',
  SQL = 'sql',
  HTML = 'html',
  CSS = 'css',
  JSON = 'json',
  YAML = 'yaml',
  Markdown = 'markdown',
  Mermaid = 'mermaid',
  PlainText = 'plaintext',
}

export const isElementCodeLanguage = (
  value: string
): value is ElementCodeLanguage => {
  return Object.values(ElementCodeLanguage).includes(
    value as ElementCodeLanguage
  );
};
export class CodeElement extends Element {
  public language: ElementCodeLanguage;
  public text: string;

  constructor({
    language,
    text,
  }: {
    language: ElementCodeLanguage;
    text: string;
  }) {
    super(ElementType.Code);
    this.language = language;
    this.text = text;
  }
}
