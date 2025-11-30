import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout, isManagement } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/dashboard', label: 'Übersicht', icon: '📊', roles: [], exact: true },
    { path: '/dashboard/events', label: 'Events', icon: '🎪', roles: [] },
    { path: '/dashboard/my-shifts', label: 'Meine Schichten', icon: '📋', roles: [] },
    { path: '/dashboard/available-shifts', label: 'Verfügbare Schichten', icon: '⏰', roles: [] },
    { path: '/dashboard/applications', label: 'Bewerbungen', icon: '✉️', roles: ['admin', 'management', 'team_lead'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">CrewOrkanizer</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                {isManagement && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Management
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] border-r border-gray-200">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              // Check if user has required role
              if (item.roles.length > 0 && !isManagement) {
                return null;
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    (item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path))
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
