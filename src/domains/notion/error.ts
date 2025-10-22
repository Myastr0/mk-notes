import { MkNotesError } from '../errors/error';

export class NotionNestingValidationError
  extends Error
  implements MkNotesError
{
  public readonly name = 'NotionNestingValidationError';
  public readonly documentationUrl =
    'https://mk-notes.io/docs/writing/notion-limitations#list-nesting-limitations';

  constructor({ message }: { message: string }) {
    super(message);
  }
}

export const isNotionNestingValidationError = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status === 400 &&
    'body' in error &&
    typeof error.body === 'string' &&
    error.body.includes('body failed validation:') &&
    error.body.includes('.children should be not present, instead was')
  );
};
