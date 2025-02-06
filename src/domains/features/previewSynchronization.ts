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
export class PreviewSynchronization<T> {
  private sourceRepository: SourceRepository<T>;

  constructor(params: PreviewSynchronizationParams<T>) {
    this.sourceRepository = params.sourceRepository;
  }

  async execute(
    args: T,
    { format }: { format?: PreviewFormat; output?: string } = {}
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

    return sitemapSerializer(siteMap);
  }
}
