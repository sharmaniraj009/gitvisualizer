import type { Commit } from '../types';

const BRANCH_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
];

export function assignBranchColors(commits: Commit[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  const branchColorIndex = new Map<string, number>();
  let colorIndex = 0;

  for (const commit of commits) {
    const primaryBranch = commit.refs.find(r => r.type === 'branch')?.name || 'default';

    if (!branchColorIndex.has(primaryBranch)) {
      branchColorIndex.set(primaryBranch, colorIndex % BRANCH_COLORS.length);
      colorIndex++;
    }

    colorMap.set(commit.hash, BRANCH_COLORS[branchColorIndex.get(primaryBranch)!]);
  }

  // Assign default color for commits without a branch ref
  for (const commit of commits) {
    if (!colorMap.has(commit.hash)) {
      colorMap.set(commit.hash, '#6B7280'); // gray
    }
  }

  return colorMap;
}

export function getBranchColor(index: number): string {
  return BRANCH_COLORS[index % BRANCH_COLORS.length];
}
