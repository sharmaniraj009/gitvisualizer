import type { LoadRepositoryResponse, Repository } from '../types';

const API_BASE = '/api';

export async function loadRepository(path: string): Promise<Repository> {
  const response = await fetch(`${API_BASE}/repository/load`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path }),
  });

  const data: LoadRepositoryResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to load repository');
  }

  return data.data!;
}

export async function validateRepository(path: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/repository/validate?repoPath=${encodeURIComponent(path)}`);
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function uploadRepository(file: File): Promise<Repository> {
  const formData = new FormData();
  formData.append('gitZip', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data: LoadRepositoryResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload repository');
  }

  return data.data!;
}

// Essential .git files/paths needed for visualization
// Skips: hooks/, logs/, index, info/, description, temp files, lock files
const ESSENTIAL_GIT_PATTERNS = [
  // With .git/ prefix (when selecting parent folder)
  /\.git\/HEAD$/,
  /\.git\/config$/,
  /\.git\/packed-refs$/,
  /\.git\/objects\//,
  /\.git\/refs\/heads\//,
  /\.git\/refs\/tags\//,
  /\.git\/refs\/remotes\//,
  // Without .git/ prefix (when selecting .git folder directly)
  /^HEAD$/,
  /^config$/,
  /^packed-refs$/,
  /^objects\//,
  /^refs\/heads\//,
  /^refs\/tags\//,
  /^refs\/remotes\//,
];

// Paths to skip (even if they match above)
const SKIP_PATTERNS = [
  /hooks\//,
  /logs\//,
  /info\//,
  /\.lock$/,
  /COMMIT_EDITMSG/,
  /FETCH_HEAD/,
  /ORIG_HEAD/,
  /description$/,
  /^index$/,
  /\.git\/index$/,
];

function isEssentialGitFile(path: string): boolean {
  const normalized = path.replace(/\\/g, '/');

  // Skip non-essential files
  if (SKIP_PATTERNS.some((p) => p.test(normalized))) {
    return false;
  }

  // Must be in .git folder or be a .git file directly
  const isGitRelated = normalized.includes('.git/') ||
    normalized.startsWith('objects/') ||
    normalized.startsWith('refs/') ||
    normalized === 'HEAD' ||
    normalized === 'config' ||
    normalized === 'packed-refs' ||
    /^\.git\//.test(normalized);

  if (!isGitRelated) return false;

  return ESSENTIAL_GIT_PATTERNS.some((p) => p.test(normalized));
}

export async function uploadFolder(files: FileList): Promise<Repository> {
  const formData = new FormData();
  let fileCount = 0;

  // Only upload essential .git files (skip hooks, logs, index, etc.)
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const relativePath = (file as any).webkitRelativePath || file.name;

    if (isEssentialGitFile(relativePath)) {
      formData.append('files', file, relativePath);
      fileCount++;
    }
  }

  if (fileCount === 0) {
    throw new Error('No .git folder found or no essential git files in the selected directory');
  }

  const response = await fetch(`${API_BASE}/upload-folder`, {
    method: 'POST',
    body: formData,
  });

  const data: LoadRepositoryResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload folder');
  }

  return data.data!;
}
