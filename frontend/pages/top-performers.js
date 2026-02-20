import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TopPerformers() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && (user.role === 'admin' || user.role === 'recruiter')) {
      loadPerformers();
    } else {
      router.push('/dashboard');
    }
  }, [user, authLoading]);

  const loadPerformers = async () => {
    try {
      const res = await usersAPI.getTopPerformers();
      setPerformers(res.data);
    } catch (error) {
      toast.error('Failed to load top performers');
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
        <h1 className="text-3xl font-bold mb-6">⭐ Top Performers</h1>
        <p className="text-gray-400 mb-6">
          View the best performing students for recruitment and mentorship opportunities
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performers.map((performer, idx) => (
            <div key={performer.id} className="bg-dark-800 rounded-lg p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-primary-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-3">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{performer.name}</h3>
                    <p className="text-sm text-gray-400">{performer.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Employability Score</span>
                  <span className="font-bold text-green-400">{performer.employabilityScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Level</span>
                  <span className="font-bold text-primary-400">{performer.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Badges</span>
                  <span className="font-bold text-yellow-400">{performer.badges?.length || 0}</span>
                </div>
              </div>

              {performer.skills && performer.skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <p className="text-sm text-gray-400 mb-2">Top Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {performer.skills.slice(0, 3).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs bg-primary-600 px-2 py-1 rounded"
                      >
                        {skill.skill} ({skill.proficiency}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {performers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No performers data available</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
