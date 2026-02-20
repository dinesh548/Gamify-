import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { gamesAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Games() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadGames();
    }
  }, [user, authLoading]);

  const loadGames = async () => {
    try {
      const res = await gamesAPI.getAll();
      setGames(res.data);
    } catch (error) {
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter((game) => {
    if (filter === 'all') return true;
    return game.difficulty === filter || (game.gameData && game.gameData.difficulty === filter);
  });

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🎮 Games Library</h1>
          <div className="flex gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setFilter(difficulty)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === difficulty
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const gameData = game.gameData || game;
            const difficulty = game.difficulty || gameData.difficulty || 'beginner';
            const skillsTagged = game.skillsTagged || gameData.skillsTagged || [];
            const type = game.type || gameData.type || 'quiz';

            return (
              <Link
                key={game.gameId || gameData.gameId}
                href={`/games/${game.gameId || gameData.gameId}`}
                className="bg-dark-800 rounded-lg p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{gameData.title || gameData.gameId}</h3>
                    <p className="text-gray-400 text-sm">{gameData.description || 'No description'}</p>
                  </div>
                  <span className="text-3xl">
                    {type === 'quiz' ? '📝' : type === 'coding' ? '💻' : '🎯'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      difficulty === 'beginner'
                        ? 'bg-green-600'
                        : difficulty === 'intermediate'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                  >
                    {difficulty}
                  </span>
                  {skillsTagged.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-primary-600 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    XP Reward: <span className="text-primary-400 font-semibold">
                      {game.xpReward || gameData.xpReward || 10}
                    </span>
                  </span>
                  <span className="text-primary-400 font-medium">Play →</span>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No games found</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
