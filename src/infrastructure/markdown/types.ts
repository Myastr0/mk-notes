import { Token } from 'marked';

// --- Marked Tokens ---
export interface MetadataToken {
  type: 'metadata';
  raw: string;
  text: string;
  metadata: {
    property: string;
    value: string;
  };
}

export type ExtendedToken = Token | MetadataToken;
