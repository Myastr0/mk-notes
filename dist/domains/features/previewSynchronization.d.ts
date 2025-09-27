import { type SourceRepository } from '../../domains/synchronization';
interface PreviewSynchronizationParams<T> {
    sourceRepository: SourceRepository<T>;
}
export type PreviewFormat = 'plainText' | 'json';
export declare const isValidFormat: (format: unknown) => format is PreviewFormat;
export declare class PreviewSynchronization<T> {
    private sourceRepository;
    constructor(params: PreviewSynchronizationParams<T>);
    execute(args: T, { format }?: {
        format?: PreviewFormat;
        output?: string;
    }): Promise<string>;
}
export {};
