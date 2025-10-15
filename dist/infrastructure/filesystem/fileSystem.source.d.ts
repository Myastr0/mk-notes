import { File } from '../../domains/synchronization';
import { SourceRepository } from '../../domains/synchronization';
export declare class FileSystemSourceRepository implements SourceRepository<{
    path: string;
}> {
    private isFile;
    private isDirectory;
    private isReadableRecursiveSync;
    private isReadableFile;
    sourceIsAccessible({ path }: {
        path: string;
    }): Promise<boolean>;
    getFilePathList({ path }: {
        path: string;
    }): Promise<string[]>;
    private getLastUpdatedDate;
    getFile({ path }: {
        path: string;
    }): Promise<File>;
}
