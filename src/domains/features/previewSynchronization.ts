import { SiteMap } from '@/domains/sitemap';
import { type SourceRepository } from '@/domains/synchronization';

interface PreviewSynchronizationParams<T> {
  sourceRepository: SourceRepository<T>;
}

export class PreviewSynchronization<T> {
  private sourceRepository: SourceRepository<T>;

  constructor(params: PreviewSynchronizationParams<T>) {
    this.sourceRepository = params.sourceRepository;
  }

  async execute(args: T): Promise<SiteMap> {
    // Check if the GitHub repository is accessible
    try {
      await this.sourceRepository.sourceIsAccessible(args);
    } catch (err) {
      throw new Error(`Source is not accessible:`, {
        cause: err,
      });
    }

    const filePaths = await this.sourceRepository.getFilePathList(args);

    return SiteMap.buildFromFilePaths(filePaths);
  }
}
