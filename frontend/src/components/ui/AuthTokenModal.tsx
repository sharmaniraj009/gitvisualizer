import { useState } from 'react';
import { useRepositoryStore } from '../../store/repositoryStore';

export function AuthTokenModal() {
  const {
    showAuthModal,
    pendingCloneUrl,
    dismissAuthModal,
    retryCloneWithToken,
  } = useRepositoryStore();
  const [token, setToken] = useState('');
  const [saveToken, setSaveToken] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showAuthModal || !pendingCloneUrl) {
    return null;
  }

  // Detect the provider from the URL
  const getProvider = (url: string): string => {
    if (url.includes('github.com')) return 'GitHub';
    if (url.includes('gitlab.com')) return 'GitLab';
    if (url.includes('bitbucket.org')) return 'Bitbucket';
    return 'Git';
  };

  const provider = getProvider(pendingCloneUrl);

  const getTokenHelpUrl = (): string => {
    switch (provider) {
      case 'GitHub':
        return 'https://github.com/settings/tokens/new?description=Git%20Visualizer&scopes=repo';
      case 'GitLab':
        return 'https://gitlab.com/-/user_settings/personal_access_tokens';
      case 'Bitbucket':
        return 'https://bitbucket.org/account/settings/app-passwords/';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsSubmitting(true);
    try {
      await retryCloneWithToken(token.trim(), saveToken);
    } finally {
      setIsSubmitting(false);
      setToken('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Authentication Required</h2>
              <p className="text-sm text-purple-700">
                This is a private repository
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <p className="text-gray-600 mb-4">
            To access this private {provider} repository, please enter a Personal Access Token (PAT)
            with repository read permissions.
          </p>

          <div className="space-y-4">
            {/* Token Input */}
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Access Token
              </label>
              <input
                type="password"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={`Enter your ${provider} token`}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {/* Save Token Checkbox */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToken}
                onChange={(e) => setSaveToken(e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Remember token for future private repositories</span>
            </label>

            {/* Help Link */}
            {getTokenHelpUrl() && (
              <p className="text-sm text-gray-500">
                Don't have a token?{' '}
                <a
                  href={getTokenHelpUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Create one on {provider}
                </a>
              </p>
            )}

            {/* Security Note */}
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <strong>Security:</strong> Your token is sent directly to {provider} for authentication
              and is {saveToken ? 'stored locally in your browser' : 'not stored'}. We never log or store tokens on our servers.
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={dismissAuthModal}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!token.trim() || isSubmitting}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Authenticating...
              </>
            ) : (
              'Clone Repository'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
