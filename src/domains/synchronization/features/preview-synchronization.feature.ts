import { SiteMap } from '@/domains/sitemap';
import {
  serializeInJson,
  serializeInPlainText,
  SitemapSerializer,
} from '@/domains/sitemap/serializers';
import { type SourceRepository } from '@/domains/synchronization';

interface PreviewSynchronizationParams<T> {
  sourceRepository: SourceRepository<T>;
}

export type PreviewFormat = 'plainText' | 'json';

export const isValidFormat = (format: unknown): format is PreviewFormat => {
  return (
    typeof format === 'string' && (format === 'plainText' || format === 'json')
  );
};

export interface PreviewSynchronizationOptions {
  /** The format of the preview */
  format?: PreviewFormat;

  /** When true, flatten the result page tree */
  flatten?: boolean;
}

export class PreviewSynchronization<T> {
  private sourceRepository: SourceRepository<T>;

  constructor(params: PreviewSynchronizationParams<T>) {
    this.sourceRepository = params.sourceRepository;
  }

  async execute(
    args: T,
    { format, flatten }: PreviewSynchronizationOptions = {}
  ): Promise<string> {
    // Check if the source repository is accessible
    try {
      await this.sourceRepository.sourceIsAccessible(args);
    } catch (err) {
      throw new Error(`Source is not accessible:`, {
        cause: err,
      });
    }
    let sitemapSerializer: SitemapSerializer;

    if (!format) {
      sitemapSerializer = serializeInPlainText;
    } else {
      switch (format) {
        case 'plainText':
          sitemapSerializer = serializeInPlainText;
          break;
        case 'json':
          sitemapSerializer = serializeInJson;
          break;
        default:
          throw new Error(`Invalid serialization format:`, format);
      }
    }

    const filePaths = await this.sourceRepository.getFilePathList(args);

    let siteMap = SiteMap.buildFromFilePaths(filePaths);

    if (flatten) {
      siteMap = siteMap.flatten();
    }

    return sitemapSerializer(siteMap);
  }
}
