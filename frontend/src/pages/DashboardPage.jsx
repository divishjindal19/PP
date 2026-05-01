// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendAPI, analyticsAPI } from '../api/client';
import {
  BookOpen, Calendar, MessageCircle, TrendingUp,
  Star, ArrowRight, Zap, Trophy, Target, Users,
  AlertCircle, RefreshCw,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, delay = 1 }) {
  return (
    <div className={`glass-card p-5 flex items-center gap-4 glow-hover animate-slide-up stagger-${delay}`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function CourseCard({ course, index }) {
  const pct = Math.round((course.match_score || 0) * 100);
  const diffColor = { Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171' }[course.difficulty] || '#34d399';
  return (
    <div className="glass-card p-4 glow-hover animate-slide-up" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm font-semibold text-white truncate">{course.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{course.domain}</p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${diffColor}15`, color: diffColor }}>
          {course.difficulty}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--border)' }}>
          <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#10b981,#34d399)' }} />
        </div>
        <span className="text-xs text-emerald-400 font-medium">{pct}%</span>
      </div>
      <p className="text-xs text-gray-400 italic">💡 {course.reason}</p>
      <div className="flex items-center gap-1 mt-2">
        <Star size={11} className="text-yellow-400" />
        <span className="text-xs text-gray-400">{course.rating} • {course.credits} credits</span>
      </div>
    </div>
  );
}

function ErrorBanner({ onRetry }) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3 mb-6"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
      <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-red-300 font-medium">Backend not reachable</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Make sure the backend is running: <code className="text-emerald-400">uvicorn main:app --reload</code> in the <code className="text-emerald-400">backend/</code> folder
        </p>
      </div>
      <button onClick={onRetry} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 flex-shrink-0">
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [courses, setCourses]     = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    setError(false);
    try {
      const [cRes, aRes] = await Promise.all([
        recommendAPI.getCourses(profile, 6),
        analyticsAPI.getDashboard(),
      ]);
      setCourses(cRes.data.recommendations || []);
      setAnalytics(aRes.data);
    } catch (e) {
      console.error('Dashboard load error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [profile?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.name?.split(' ')[0] || 'Student';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white">
          {greeting}, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          {profile?.branch} • Year {profile?.year} • GPA {profile?.gpa} • Goal: {profile?.career_goal}
        </p>
      </div>

      {/* Error banner */}
      {error && <ErrorBanner onRetry={load} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Trophy} label="Current GPA"     value={profile?.gpa ?? '—'}                    color="#10b981" delay={1} />
        <StatCard icon={BookOpen} label="Courses Done"  value={profile?.completed_courses?.length ?? 0} color="#3b82f6" delay={2} />
        <StatCard icon={Target}   label="Career Goal"   value={(profile?.career_goal || '—').split(' ')[0]} color="#f59e0b" delay={3} />
        <StatCard icon={Users}    label="Study Year"    value={`Year ${profile?.year ?? '?'}`}          color="#8b5cf6" delay={4} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/recommendations', label: 'Explore Courses', icon: BookOpen,       color: '#10b981' },
          { to: '/semester-plan',   label: 'Semester Plan',   icon: Calendar,       color: '#3b82f6' },
          { to: '/chatbot',         label: 'Ask AI Advisor',  icon: MessageCircle,  color: '#8b5cf6' },
          { to: '/analytics',       label: 'View Analytics',  icon: TrendingUp,     color: '#f59e0b' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link key={to} to={to}
            className="glass-card p-4 flex flex-col gap-2 glow-hover transition-all duration-200 hover:scale-[1.02] animate-fade-in">
            <Icon size={20} style={{ color }} />
            <span className="text-sm font-medium text-white">{label}</span>
            <ArrowRight size={14} className="text-gray-500" />
          </Link>
        ))}
      </div>

      {/* Recommended courses */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Recommended for You</h2>
          </div>
          <Link to="/recommendations" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-4 h-32 animate-pulse" style={{ background: 'var(--bg-card2)' }} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        ) : !error ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No recommendations yet — update your profile!</p>
          </div>
        ) : null}
      </div>

      {/* Platform stats + Top courses */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 animate-slide-up">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Star size={15} className="text-yellow-400" /> Top Rated Courses
            </h3>
            <div className="space-y-2">
              {(analytics.popular_courses || []).map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-sm text-white">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.domain}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400" />
                    <span className="text-sm text-gray-300">{c.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 animate-slide-up stagger-2">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" /> Platform Overview
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Courses',    val: analytics.total_courses },
                { label: 'Events & Clubs',   val: analytics.total_events },
                { label: 'Career Paths',     val: analytics.total_careers },
                { label: 'Study Materials',  val: analytics.total_materials },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card2)' }}>
                  <p className="text-xl font-bold text-emerald-400">{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
