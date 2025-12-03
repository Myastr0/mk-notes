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

export class PreviewSynchronization<T> {
  private sourceRepository: SourceRepository<T>;

  constructor(params: PreviewSynchronizationParams<T>) {
    this.sourceRepository = params.sourceRepository;
  }

  async execute(
    args: T,
    {
      format,
      flat = false,
    }: { format?: PreviewFormat; output?: string; flat?: boolean } = {}
  ): Promise<string> {
    // Check if the GitHub repository is accessible
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

    const siteMap = SiteMap.buildFromFilePaths(filePaths);

    if (flat) {
      siteMap.flatten();
    }

    return sitemapSerializer(siteMap);
  }
}
