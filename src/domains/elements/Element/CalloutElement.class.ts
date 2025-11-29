import { SupportedEmoji } from '../types';
import { Element } from './Element.class';
import { ElementType } from './types';

const specialCalloutRegex =
  // eslint-disable-next-line no-useless-escape
  /^\s*\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](.*)/ims;

export enum SpecialCalloutType {
  Note = 'note',
  Tip = 'tip',
  Important = 'important',
  Warning = 'warning',
  Caution = 'caution',
}

export class CalloutElement extends Element {
  public text: string;
  private readonly icon?: SupportedEmoji;
  private readonly calloutType?: SpecialCalloutType;

  public static isSpecialCalloutText(text: string): boolean {
    return specialCalloutRegex.test(text.trim());
  }

  constructor({ icon, text }: { icon?: SupportedEmoji; text: string }) {
    super(ElementType.Callout);
    this.icon = icon;
    this.text = text;

    const { text: parsedText, calloutType } =
      this.getSpecialCalloutTypeAndText(text);

    if (calloutType) {
      this.calloutType = calloutType;
      this.text = parsedText;
    }
  }

  private getSpecialCalloutTypeAndText(text: string): {
    calloutType: SpecialCalloutType | null;
    text: string;
  } {
    const textToSpecialCalloutType: Record<string, SpecialCalloutType> = {
      note: SpecialCalloutType.Note,
      tip: SpecialCalloutType.Tip,
      important: SpecialCalloutType.Important,
      warning: SpecialCalloutType.Warning,
      caution: SpecialCalloutType.Caution,
    };

    const match = specialCalloutRegex.exec(text.trim());

    if (match) {
      const typeString = match[1].toLowerCase() as SpecialCalloutType;
      const text = match[2].trim();

      const calloutType = textToSpecialCalloutType[typeString];

      if (calloutType) {
        return { calloutType, text };
      }
    }

    return {
      calloutType: null,
      text,
    };
  }
  public getIcon(): SupportedEmoji | undefined {
    const iconMap: Record<SpecialCalloutType, SupportedEmoji> = {
      [SpecialCalloutType.Note]: 'ℹ️',
      [SpecialCalloutType.Tip]: '💡',
      [SpecialCalloutType.Important]: '⚠️',
      [SpecialCalloutType.Warning]: '⚠️',
      [SpecialCalloutType.Caution]: '⚠️',
    };

    if (this.calloutType && iconMap[this.calloutType]) {
      return iconMap[this.calloutType];
    }

    return this.icon;
  }
}
