import React, { useState, useCallback } from 'react';
import { generateUsernames } from './services/geminiService';
import type { Username, WordPosition, Category, AvailabilityStatus } from './types';
import { CATEGORIES } from './constants';
import { SparklesIcon, HeartIcon, ClipboardIcon, TrashIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from './components/Icons';

const App: React.FC = () => {
  const [seedWord, setSeedWord] = useState<string>('');
  const [category, setCategory] = useState<Category>('Gaming');
  const [wordPosition, setWordPosition] = useState<WordPosition>('before');
  const [generatedUsernames, setGeneratedUsernames] = useState<Username[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!seedWord.trim()) {
      setError('Please enter a word to start.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedUsernames([]);

    try {
      const names = await generateUsernames(seedWord, category, wordPosition);
      const usernamesWithStatus: Username[] = names.map(name => ({
        id: crypto.randomUUID(),
        name,
        availability: 'unchecked',
      }));
      setGeneratedUsernames(usernamesWithStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [seedWord, category, wordPosition]);

  const handleToggleFavorite = (name: string) => {
    setFavorites(prev =>
      prev.includes(name) ? prev.filter(fav => fav !== name) : [...prev, name]
    );
  };

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedUsername(name);
    setTimeout(() => setCopiedUsername(null), 2000);
  };

  const handleCheckAvailability = (id: string) => {
    setGeneratedUsernames(prev =>
      prev.map(u => (u.id === id ? { ...u, availability: 'checking' } : u))
    );

    setTimeout(() => {
      setGeneratedUsernames(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, availability: Math.random() > 0.5 ? 'available' : 'taken' }
            : u
        )
      );
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Generator */}
        <div className="lg:col-span-2">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-3">
              <SparklesIcon className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                AI Username Generator
              </h1>
            </div>
            <p className="text-gray-400 mt-2">Instantly create unique names with a touch of AI magic.</p>
          </header>

          <main className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-2xl space-y-4">
              {/* Row 1: Word Input & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seedWord" className="block text-sm font-medium text-gray-300 mb-1">Your Word</label>
                  <input
                    id="seedWord"
                    type="text"
                    value={seedWord}
                    onChange={(e) => setSeedWord(e.target.value)}
                    placeholder="e.g., Nova, Shadow, Cyber"
                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none"
                    style={{ background: 'url(\'data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\') no-repeat right 0.75rem center/1.5em 1.5em', backgroundBlendMode: 'color-burn', backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-gray-800">{cat}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Row 2: Position Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Word Position</label>
                <div className="flex bg-white/5 border border-white/10 rounded-md p-1 w-full md:w-1/2">
                  <button onClick={() => setWordPosition('before')} className={`w-1/2 py-1.5 rounded text-sm font-semibold transition ${wordPosition === 'before' ? 'bg-purple-600 shadow-md' : 'hover:bg-white/10'}`}>Before</button>
                  <button onClick={() => setWordPosition('after')} className={`w-1/2 py-1.5 rounded text-sm font-semibold transition ${wordPosition === 'after' ? 'bg-purple-600 shadow-md' : 'hover:bg-white/10'}`}>After</button>
                </div>
              </div>

              {/* Row 3: Generate Button */}
              <div>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLoading 
                      ? 'animate-gradient-pan' 
                      : 'hover:from-purple-700 hover:to-pink-700'
                  }`}
                >
                  {isLoading ? <><LoaderIcon className="w-5 h-5 animate-spin" /> Generating...</> : <><SparklesIcon className="w-5 h-5" /> Generate Usernames</>}
                </button>
                {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-2xl min-h-[200px]">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">Suggestions</h2>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <LoaderIcon className="w-8 h-8 animate-spin text-purple-400" />
                    </div>
                ) : generatedUsernames.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {generatedUsernames.map(u => (
                            <UsernameItem 
                                key={u.id}
                                username={u}
                                isFavorite={favorites.includes(u.name)}
                                isCopied={copiedUsername === u.name}
                                onCheckAvailability={() => handleCheckAvailability(u.id)}
                                onToggleFavorite={() => handleToggleFavorite(u.name)}
                                onCopy={() => handleCopy(u.name)}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="flex justify-center items-center h-48 text-gray-500">
                        Your generated usernames will appear here.
                    </div>
                )}
            </div>
          </main>
        </div>

        {/* Sidebar: Favorites */}
        <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-2xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-200 flex items-center gap-2">
                    <HeartIcon className="w-6 h-6 text-pink-500" isFilled={true} />
                    Favorites
                </h2>
                {favorites.length > 0 ? (
                    <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                        {favorites.map(fav => (
                            <li key={fav} className="flex items-center justify-between bg-white/5 p-2 rounded-md">
                                <span className="font-mono text-gray-300">{fav}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleCopy(fav)} title="Copy" className="text-gray-400 hover:text-white transition">
                                        <ClipboardIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleToggleFavorite(fav)} title="Remove" className="text-gray-400 hover:text-red-500 transition">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm">Click the heart icon to save your favorite names.</p>
                )}
            </div>
        </aside>
      </div>
    </div>
  );
};

// Sub-component for displaying a single username
interface UsernameItemProps {
    username: Username;
    isFavorite: boolean;
    isCopied: boolean;
    onCheckAvailability: () => void;
    onToggleFavorite: () => void;
    onCopy: () => void;
}

const UsernameItem: React.FC<UsernameItemProps> = ({ username, isFavorite, isCopied, onCheckAvailability, onToggleFavorite, onCopy }) => {
    const renderAvailability = () => {
        switch (username.availability) {
            case 'checking':
                return <LoaderIcon className="w-5 h-5 animate-spin text-gray-400" />;
            case 'available':
                return <div className="flex items-center justify-center gap-1 text-green-400"><CheckCircleIcon className="w-5 h-5" /> Available</div>;
            case 'taken':
                return <div className="flex items-center justify-center gap-1 text-red-400"><XCircleIcon className="w-5 h-5" /> Taken</div>;
            case 'unchecked':
            default:
                return <button onClick={onCheckAvailability} className="text-sm text-purple-400 hover:text-purple-300 transition font-semibold">Check</button>;
        }
    };

    return (
        <li className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition duration-200">
            <span className="font-mono text-lg text-gray-200">{username.name}</span>
            <div className="flex items-center gap-4">
                <div className="text-sm w-24 flex justify-center items-center">
                    {renderAvailability()}
                </div>
                <button onClick={onToggleFavorite} title={isFavorite ? "Unfavorite" : "Favorite"} className="text-gray-400 hover:text-pink-500 transition">
                    <HeartIcon className="w-5 h-5" isFilled={isFavorite} />
                </button>
                <button onClick={onCopy} title="Copy" className="text-gray-400 hover:text-white transition">
                    {isCopied ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                </button>
            </div>
        </li>
    );
};

export default App;
