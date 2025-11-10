import type { ArchiveCategoryDto } from '../../types';

export interface UseCategoryArchiveOptions {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}

export interface UseCategoryArchiveReturn {
  archive: (id: number, data: ArchiveCategoryDto) => Promise<{ success: boolean }>;
  isArchiving: boolean;
  error: Error | null;
}
