export interface Author {
  name: string;
  email: string;
}

export interface RefInfo {
  name: string;
  type: 'branch' | 'tag' | 'remote';
  isHead: boolean;
}

export interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  body: string;
  author: Author;
  date: string;
  parents: string[];
  refs: RefInfo[];
}

export interface Branch {
  name: string;
  commit: string;
  isRemote: boolean;
  isHead: boolean;
}

export interface Tag {
  name: string;
  commit: string;
}

export interface Repository {
  path: string;
  name: string;
  currentBranch: string;
  commits: Commit[];
  branches: Branch[];
  tags: Tag[];
}

export interface LoadRepositoryResponse {
  success: boolean;
  data?: Repository;
  error?: string;
}
