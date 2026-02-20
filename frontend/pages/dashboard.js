import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { analyticsAPI, gamesAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      const [analyticsRes, gamesRes] = await Promise.all([
        analyticsAPI.getStudent(),
        gamesAPI.getAll(),
      ]);
      setStats(analyticsRes.data);
      setGames(gamesRes.data.slice(0, 6));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  const xpForNextLevel = Math.pow(user.level, 2) * 100;
  const xpProgress = ((user.xp % (Math.pow(user.level - 1, 2) * 100 || 100)) / (xpForNextLevel - (Math.pow(user.level - 1, 2) * 100 || 0))) * 100;

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.name}</span>! 👋
          </h1>
          <p className="text-gray-400">Continue your learning journey and boost your employability</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-800 rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total XP</p>
                <p className="text-3xl font-bold text-primary-400">{user?.xp || 0}</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Level</p>
                <p className="text-3xl font-bold text-purple-400">{user?.level || 1}</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round(xpProgress)}% to Level {user?.level + 1}
              </p>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Employability Score</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats?.user?.employabilityScore || 0}%
                </p>
              </div>
              <div className="text-4xl">💼</div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Streak</p>
                <p className="text-3xl font-bold text-orange-400">{user?.streak || 0} days</p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">🎮 Featured Games</h2>
            <div className="space-y-3">
              {games.length > 0 ? (
                games.map((game) => (
                  <Link
                    key={game.gameId}
                    href={`/games/${game.gameId}`}
                    className="block bg-dark-700 hover:bg-dark-600 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{game.title || game.gameId}</h3>
                        <p className="text-sm text-gray-400">
                          {game.type} • {game.difficulty}
                        </p>
                      </div>
                      <div className="text-primary-400">→</div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-400">No games available</p>
              )}
            </div>
            <Link
              href="/games"
              className="mt-4 inline-block text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              View all games →
            </Link>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">📊 Skill Overview</h2>
            {stats?.skillHeatmap && stats.skillHeatmap.length > 0 ? (
              <div className="space-y-3">
                {stats.skillHeatmap.map((skill) => (
                  <div key={skill.skill} className="bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{skill.skill}</span>
                      <span className="text-sm text-gray-400">
                        {Math.round(skill.accuracy || 0)}% accuracy
                      </span>
                    </div>
                    <div className="w-full bg-dark-600 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${skill.accuracy || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {skill.attempts || 0} games completed
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Start playing games to see your skills!</p>
            )}
          </div>
        </div>

        {/* Badges */}
        {user?.badges && user.badges.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">🏅 Your Badges</h2>
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, index) => (
                <span
                  key={index}
                  className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
