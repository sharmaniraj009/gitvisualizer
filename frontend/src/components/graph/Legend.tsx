import { useState } from "react";
import { ChevronDown, ChevronUp, GitBranch } from "lucide-react";

interface LegendProps {
  branchColors: Map<string, string>;
  className?: string;
  onBranchClick?: (branch: string) => void;
}

export function Legend({
  branchColors,
  className = "",
  onBranchClick,
}: LegendProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!branchColors || branchColors.size === 0) {
    return null;
  }

  // Convert Map to array and sort mainly by name, but maybe prioritizes 'master'/'main'
  const branches = Array.from(branchColors.entries()).sort((a, b) => {
    const nameA = a[0];
    const nameB = b[0];
    if (nameA === "main" || nameA === "master") return -1;
    if (nameB === "main" || nameB === "master") return 1;
    return nameA.localeCompare(nameB);
  });

  return (
    <div
      className={`absolute bottom-3 right-11 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 ${className}`}
      style={{ maxWidth: "250px" }}
    >
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <GitBranch className="w-4 h-4" />
          <span>Branch Legend</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {isOpen && (
        <div className="p-3 pt-0 max-h-60 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {branches.map(([branch, color]) => (
              <div
                key={branch}
                className={`flex items-center gap-2 group ${onBranchClick ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 -m-1 rounded ml-1" : ""}`}
                onClick={() => onBranchClick?.(branch)}
                title={`Jump to ${branch}`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {branch}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
