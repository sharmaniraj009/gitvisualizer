import { useState, type FormEvent } from 'react';
import { useRepositoryStore } from '../../store/repositoryStore';

export function PathInput() {
  const [path, setPath] = useState('');
  const { loadRepo, isLoading, error, repository } = useRepositoryStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (path.trim()) {
      await loadRepo(path.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="Enter path to git repository (e.g., /home/user/my-project)"
          className={`
            w-full px-4 py-2 rounded-lg border bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
          disabled={isLoading}
        />
        {repository && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !path.trim()}
        className={`
          px-6 py-2 rounded-lg font-medium transition-colors
          ${isLoading || !path.trim()
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
        ) : (
          'Visualize'
        )}
      </button>
    </form>
  );
}
