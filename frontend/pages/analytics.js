import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { analyticsAPI } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadAnalytics();
    }
  }, [user, authLoading]);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsAPI.getStudent();
      setAnalytics(res.data);
    } catch (error) {
      toast.error('Failed to load analytics');
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

  const skillRadarData = analytics?.skillHeatmap?.map(skill => ({
    skill: skill.skill,
    level: skill.level || 0,
    accuracy: skill.accuracy || 0,
    fullMark: 100
  })) || [];

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-6">📊 Analytics Dashboard</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total Games</p>
            <p className="text-3xl font-bold">{analytics?.totalGamesPlayed || 0}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Current Level</p>
            <p className="text-3xl font-bold text-primary-400">{analytics?.user?.level || 1}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Employability Score</p>
            <p className="text-3xl font-bold text-green-400">
              {analytics?.user?.employabilityScore || 0}%
            </p>
          </div>
          <div className="bg-dark-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Current Streak</p>
            <p className="text-3xl font-bold text-orange-400">{analytics?.user?.streak || 0} days</p>
          </div>
        </div>

        {/* Score Trends */}
        {analytics?.scoreTrends && analytics.scoreTrends.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Score Trends (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.scoreTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                <Legend />
                <Line type="monotone" dataKey="averageScore" stroke="#0EA5E9" strokeWidth={2} name="Average Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Skill Heatmap */}
        {analytics?.skillHeatmap && analytics.skillHeatmap.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Skill Accuracy</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.skillHeatmap}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="skill" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Bar dataKey="accuracy" fill="#0EA5E9" name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Skill Radar</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="skill" stroke="#9CA3AF" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Games */}
        {analytics?.recentGames && analytics.recentGames.length > 0 && (
          <div className="bg-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Games</h2>
            <div className="space-y-3">
              {analytics.recentGames.map((game, idx) => (
                <div key={idx} className="bg-dark-700 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{game.gameId}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(game.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary-400 font-semibold">Score: {game.score}%</p>
                    <p className="text-sm text-gray-400">Accuracy: {game.accuracy}%</p>
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
