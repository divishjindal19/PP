// src/components/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, BookOpen, MessageCircle,
  BarChart3, Calendar, LogOut, GraduationCap, Zap
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/recommendations', label: 'Recommendations', icon: BookOpen },
  { to: '/semester-plan', label: 'Semester Plan', icon: Calendar },
  { to: '/chatbot', label: 'AI Advisor', icon: MessageCircle },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Layout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (profile?.name || user?.name || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white leading-none">UniAdvisor</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--accent-light)' }}>AI Academic Advisor</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'nav-active'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* AI Status badge */}
        <div className="p-3">
          <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">AI Models Active</span>
            <Zap size={12} className="text-emerald-400 ml-auto" />
          </div>
        </div>

        {/* User footer */}
        <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.name || user?.name || 'Student'}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {profile?.branch || 'CS'} • Year {profile?.year || '?'}
              </p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
