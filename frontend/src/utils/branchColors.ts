import type { Commit } from "../types";

const BRANCH_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
];

export interface ColorMaps {
  commitColors: Map<string, string>;
  branchColors: Map<string, string>;
}

export function assignBranchColors(commits: Commit[]): ColorMaps {
  const commitColors = new Map<string, string>();
  const branchColors = new Map<string, string>();
  let colorIndex = 0;

  // Helper to get next color
  const getNextColor = () => {
    const color = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];
    colorIndex++;
    return color;
  };

  // Traverse commits (newest to oldest) to assign/propagate colors
  for (const commit of commits) {
    const inheritedColor = commitColors.get(commit.hash);

    // Explicit Branch/Remote tips on this commit
    const refs = commit.refs.filter(
      (r) => r.type === "branch" || r.type === "remote",
    );

    let myColor: string;

    if (inheritedColor) {
      // Case A: Inherited Color (assigned by a child)
      // Any branches pointing here should adopt this color (e.g. origin/main adopts main's color)
      myColor = inheritedColor;
      for (const r of refs) {
        if (!branchColors.has(r.name)) {
          branchColors.set(r.name, myColor);
        }
      }
    } else {
      // Case B: No Inherited Color
      // This is a start of a branch (tip) or an informative commit
      myColor = getNextColor();

      // Assign to all refs found here
      for (const r of refs) {
        if (!branchColors.has(r.name)) {
          branchColors.set(r.name, myColor);
        }
      }
    }

    // Ensure commit has color set
    commitColors.set(commit.hash, myColor);

    // Propagate to First Parent
    // (Standard git flow: first parent continues the branch)
    if (commit.parents.length > 0) {
      const firstParentHash = commit.parents[0];

      // We only assign if not already assigned.
      // The first child (Newest) wins the color rights for the parent (Main line).
      if (!commitColors.has(firstParentHash)) {
        commitColors.set(firstParentHash, myColor);
      }
    }
  }

  // Ensure "default" branch has a color if it ends up being used somewhere fallback
  if (!branchColors.has("default")) {
    branchColors.set("default", "#6B7280");
  }

  return { commitColors, branchColors };
}

export function getBranchColor(index: number): string {
  return BRANCH_COLORS[index % BRANCH_COLORS.length];
}

// Generate a consistent color from a string (email) using hash
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  // Generate HSL color with good saturation and lightness for visibility
  const h = Math.abs(hash % 360);
  const s = 65 + (Math.abs(hash >> 8) % 20); // 65-85%
  const l = 45 + (Math.abs(hash >> 16) % 15); // 45-60%

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function assignAuthorColors(commits: Commit[]): Map<string, string> {
  const colorMap = new Map<string, string>();
  const authorColorCache = new Map<string, string>();

  for (const commit of commits) {
    const authorEmail = commit.author.email.toLowerCase();

    if (!authorColorCache.has(authorEmail)) {
      authorColorCache.set(authorEmail, stringToColor(authorEmail));
    }

    colorMap.set(commit.hash, authorColorCache.get(authorEmail)!);
  }

  return colorMap;
}
