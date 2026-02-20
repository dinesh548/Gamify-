import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { leaderboardAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Leaderboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState(null);
  const [type, setType] = useState('xp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadLeaderboard();
    }
  }, [user, authLoading, type]);

  const loadLeaderboard = async () => {
    try {
      const res = await leaderboardAPI.get(type);
      setLeaderboard(res.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
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

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {['xp', 'level', 'employability', 'streak'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                type === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* User Rank */}
        {leaderboard?.userRank && (
          <div className="bg-primary-900/20 border-2 border-primary-500 rounded-lg p-4 mb-6">
            <p className="text-center">
              <span className="font-semibold">Your Rank:</span>{' '}
              <span className="text-primary-400 text-xl font-bold">
                #{leaderboard.userRank}
              </span>
            </p>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-dark-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">XP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {leaderboard?.leaderboard?.map((entry, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-dark-700 ${
                    entry.name === user?.name ? 'bg-primary-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold">{getRankIcon(entry.rank)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{entry.name}</span>
                    {entry.name === user?.name && (
                      <span className="ml-2 text-xs bg-primary-600 px-2 py-1 rounded">You</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-primary-400">{entry.xp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-400">
                    {entry.employabilityScore}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-orange-400">{entry.streak} 🔥</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!leaderboard?.leaderboard || leaderboard.leaderboard.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No leaderboard data available</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
