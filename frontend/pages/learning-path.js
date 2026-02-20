import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { learningPathAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LearningPath() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadLearningPath();
    }
  }, [user, authLoading]);

  const loadLearningPath = async () => {
    try {
      const res = await learningPathAPI.get();
      setLearningPath(res.data);
    } catch (error) {
      toast.error('Failed to load learning path');
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

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-6">🗺️ Your Personalized Learning Path</h1>

        {/* Overview */}
        {learningPath && (
          <div className="bg-dark-800 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Current Level</p>
                <p className="text-3xl font-bold text-primary-400">{learningPath.currentLevel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Target Level</p>
                <p className="text-3xl font-bold text-green-400">{learningPath.targetLevel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Estimated Time</p>
                <p className="text-3xl font-bold text-yellow-400">{learningPath.estimatedWeeks} weeks</p>
              </div>
            </div>
          </div>
        )}

        {/* Skill Gaps */}
        {learningPath?.skillGaps && learningPath.skillGaps.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">🎯 Skill Gaps Identified</h2>
            <div className="space-y-3">
              {learningPath.skillGaps.map((gap, idx) => (
                <div key={idx} className="bg-dark-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{gap.skill}</span>
                    <span className="text-sm text-gray-400">Priority: {gap.priority.toFixed(1)}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Current: {gap.currentAccuracy.toFixed(1)}% accuracy, {gap.currentAttempts} attempts
                  </div>
                  <div className="mt-2 w-full bg-dark-600 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min(gap.gap * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {learningPath?.recommendations && learningPath.recommendations.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">💡 Recommended Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningPath.recommendations.slice(0, 6).map((game, idx) => (
                <Link
                  key={idx}
                  href={`/games/${game.gameId}`}
                  className="bg-dark-700 hover:bg-dark-600 rounded-lg p-4 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold mb-1">{game.title}</h3>
                      <p className="text-sm text-gray-400">
                        {game.type} • {game.difficulty}
                      </p>
                    </div>
                    <span className="text-primary-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Learning Path Timeline */}
        {learningPath?.learningPath && learningPath.learningPath.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">📅 Weekly Learning Plan</h2>
            <div className="space-y-6">
              {learningPath.learningPath.map((week, idx) => (
                <div key={idx} className="border-l-4 border-primary-500 pl-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">
                      {week.week}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Week {week.week}</h3>
                      <p className="text-sm text-gray-400">Focus: {week.focus}</p>
                    </div>
                  </div>
                  <div className="ml-12 mb-4">
                    <h4 className="font-medium mb-2">Games:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {week.games.map((game, gIdx) => (
                        <Link
                          key={gIdx}
                          href={`/games/${game.gameId}`}
                          className="text-sm bg-dark-700 hover:bg-dark-600 rounded px-3 py-2 transition-colors"
                        >
                          {game.title}
                        </Link>
                      ))}
                    </div>
                    <h4 className="font-medium mb-2">Goals:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                      {week.goals.map((goal, gIdx) => (
                        <li key={gIdx}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
