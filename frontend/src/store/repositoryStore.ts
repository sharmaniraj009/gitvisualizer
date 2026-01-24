import { create } from 'zustand';
import type { Repository, Commit } from '../types';
import { loadRepository, uploadRepository, uploadFolder } from '../api/gitApi';

interface RepositoryState {
  repository: Repository | null;
  isLoading: boolean;
  error: string | null;
  selectedCommit: Commit | null;
  searchQuery: string;

  // Actions
  loadRepo: (path: string) => Promise<void>;
  uploadRepo: (file: File) => Promise<void>;
  uploadFolderRepo: (files: FileList) => Promise<void>;
  setSelectedCommit: (commit: Commit | null) => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useRepositoryStore = create<RepositoryState>((set) => ({
  repository: null,
  isLoading: false,
  error: null,
  selectedCommit: null,
  searchQuery: '',

  loadRepo: async (path: string) => {
    set({ isLoading: true, error: null, selectedCommit: null });
    try {
      const repository = await loadRepository(path);
      set({ repository, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  uploadRepo: async (file: File) => {
    set({ isLoading: true, error: null, selectedCommit: null });
    try {
      const repository = await uploadRepository(file);
      set({ repository, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  uploadFolderRepo: async (files: FileList) => {
    set({ isLoading: true, error: null, selectedCommit: null });
    try {
      const repository = await uploadFolder(files);
      set({ repository, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setSelectedCommit: (commit) => set({ selectedCommit: commit }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  reset: () => set({
    repository: null,
    selectedCommit: null,
    searchQuery: '',
    error: null,
  }),
}));
