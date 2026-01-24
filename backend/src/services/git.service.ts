import simpleGit, { SimpleGit } from 'simple-git';

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

export interface PaginationOptions {
  maxCount?: number; // Default: 500
  skip?: number; // Offset for pagination
}

export interface PaginatedCommits {
  commits: Commit[];
  total: number;
  hasMore: boolean;
}

function parseRefs(refsString: string): RefInfo[] {
  if (!refsString || refsString.trim() === '') return [];

  const refs: RefInfo[] = [];
  const parts = refsString.split(',').map(s => s.trim());

  for (const part of parts) {
    if (part.startsWith('HEAD -> ')) {
      refs.push({
        name: part.replace('HEAD -> ', ''),
        type: 'branch',
        isHead: true,
      });
    } else if (part === 'HEAD') {
      continue;
    } else if (part.startsWith('tag: ')) {
      refs.push({
        name: part.replace('tag: ', ''),
        type: 'tag',
        isHead: false,
      });
    } else if (part.startsWith('origin/')) {
      refs.push({
        name: part,
        type: 'remote',
        isHead: false,
      });
    } else if (part) {
      refs.push({
        name: part,
        type: 'branch',
        isHead: false,
      });
    }
  }

  return refs;
}

class GitService {
  private getGit(repoPath: string): SimpleGit {
    return simpleGit(repoPath);
  }

  async validateRepository(path: string): Promise<boolean> {
    try {
      const git = this.getGit(path);
      return await git.checkIsRepo();
    } catch {
      return false;
    }
  }

  async getRepository(repoPath: string): Promise<Repository> {
    const git = this.getGit(repoPath);

    const [commits, branches, tags, currentBranch] = await Promise.all([
      this.getCommits(git),
      this.getBranches(git),
      this.getTags(git),
      this.getCurrentBranch(git),
    ]);

    const name = repoPath.split('/').filter(Boolean).pop() || 'repository';

    return {
      path: repoPath,
      name,
      currentBranch,
      commits,
      branches,
      tags,
    };
  }

  private async getCommits(git: SimpleGit): Promise<Commit[]> {
    const log = await git.log({
      '--all': null,
      '--date-order': null,
      format: {
        hash: '%H',
        shortHash: '%h',
        message: '%s',
        body: '%b',
        authorName: '%an',
        authorEmail: '%ae',
        date: '%aI',
        parents: '%P',
        refs: '%D',
      },
    });

    return log.all.map((entry) => ({
      hash: entry.hash,
      shortHash: entry.shortHash,
      message: entry.message,
      body: entry.body,
      author: {
        name: entry.authorName,
        email: entry.authorEmail,
      },
      date: entry.date,
      parents: entry.parents ? entry.parents.split(' ').filter(Boolean) : [],
      refs: parseRefs(entry.refs),
    }));
  }

  private async getBranches(git: SimpleGit): Promise<Branch[]> {
    const result = await git.branch(['-a', '-v']);
    const branches: Branch[] = [];

    for (const [name, data] of Object.entries(result.branches)) {
      branches.push({
        name: data.name,
        commit: data.commit,
        isRemote: name.startsWith('remotes/'),
        isHead: data.current,
      });
    }

    return branches;
  }

  private async getTags(git: SimpleGit): Promise<Tag[]> {
    try {
      // Use show-ref --tags for O(1) instead of O(N) revparse calls
      const result = await git.raw(['show-ref', '--tags']);
      return result
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [commit, ref] = line.split(' ');
          return {
            name: ref.replace('refs/tags/', ''),
            commit,
          };
        });
    } catch {
      // No tags or error - return empty array
      return [];
    }
  }

  private async getCurrentBranch(git: SimpleGit): Promise<string> {
    try {
      const result = await git.revparse(['--abbrev-ref', 'HEAD']);
      return result.trim();
    } catch {
      return 'HEAD';
    }
  }

  private async getTotalCommitCount(git: SimpleGit): Promise<number> {
    try {
      const result = await git.raw(['rev-list', '--all', '--count']);
      return parseInt(result.trim(), 10);
    } catch {
      return 0;
    }
  }

  async getCommitsPaginated(
    repoPath: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedCommits> {
    const git = this.getGit(repoPath);
    const { maxCount = 500, skip = 0 } = options;

    const [log, total] = await Promise.all([
      git.log({
        '--all': null,
        '--date-order': null,
        maxCount: maxCount + 1, // Fetch one extra to check hasMore
        '--skip': skip,
        format: {
          hash: '%H',
          shortHash: '%h',
          message: '%s',
          body: '%b',
          authorName: '%an',
          authorEmail: '%ae',
          date: '%aI',
          parents: '%P',
          refs: '%D',
        },
      }),
      this.getTotalCommitCount(git),
    ]);

    const hasMore = log.all.length > maxCount;
    const commits = log.all.slice(0, maxCount).map((entry) => ({
      hash: entry.hash,
      shortHash: entry.shortHash,
      message: entry.message,
      body: entry.body,
      author: {
        name: entry.authorName,
        email: entry.authorEmail,
      },
      date: entry.date,
      parents: entry.parents ? entry.parents.split(' ').filter(Boolean) : [],
      refs: parseRefs(entry.refs),
    }));

    return { commits, total, hasMore };
  }

  async getCommitDetails(repoPath: string, hash: string): Promise<Commit | null> {
    const git = this.getGit(repoPath);

    try {
      const log = await git.log({
        from: hash,
        to: hash,
        format: {
          hash: '%H',
          shortHash: '%h',
          message: '%s',
          body: '%b',
          authorName: '%an',
          authorEmail: '%ae',
          date: '%aI',
          parents: '%P',
          refs: '%D',
        },
        '-1': null,
      });

      if (log.all.length === 0) return null;

      const entry = log.all[0];
      return {
        hash: entry.hash,
        shortHash: entry.shortHash,
        message: entry.message,
        body: entry.body,
        author: {
          name: entry.authorName,
          email: entry.authorEmail,
        },
        date: entry.date,
        parents: entry.parents ? entry.parents.split(' ').filter(Boolean) : [],
        refs: parseRefs(entry.refs),
      };
    } catch {
      return null;
    }
  }
}

export const gitService = new GitService();
