import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/games', label: 'Games', icon: '🎮' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/learning-path', label: 'Learning Path', icon: '🗺️' },
  ];

  if (user?.role === 'admin' || user?.role === 'recruiter') {
    navItems.push({ href: '/top-performers', label: 'Top Performers', icon: '⭐' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <nav className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center px-2 py-2">
                <span className="text-xl font-bold gradient-text">🎮 Gamify Learning</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === item.href
                        ? 'border-primary-500 text-primary-400'
                        : 'border-transparent text-gray-300 hover:text-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                <span className="font-semibold">{user?.name}</span>
                <span className="ml-2 text-xs bg-primary-600 px-2 py-1 rounded">Level {user?.level || 1}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
