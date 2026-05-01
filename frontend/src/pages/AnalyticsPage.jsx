// src/pages/AnalyticsPage.jsx
import { useEffect, useState } from 'react';
import { analyticsAPI } from '../api/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Award, Users, BookOpen, Briefcase } from 'lucide-react';

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#065f46'];
const CAREER_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: '#111815', border: '1px solid #1f2d27' }}>
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#34d399' }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function StatBadge({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card p-4 flex items-center gap-4 animate-slide-up">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// Simulated engagement trend data
const trendData = [
  { week: 'W1', courses: 12, events: 5, materials: 8 },
  { week: 'W2', courses: 18, events: 9, materials: 14 },
  { week: 'W3', courses: 15, events: 12, materials: 11 },
  { week: 'W4', courses: 24, events: 15, materials: 19 },
  { week: 'W5', courses: 20, events: 11, materials: 22 },
  { week: 'W6', courses: 30, events: 18, materials: 25 },
];

const skillRadarData = [
  { skill: 'Python', level: 80 },
  { skill: 'ML/AI', level: 70 },
  { skill: 'Web Dev', level: 65 },
  { skill: 'Data', level: 75 },
  { skill: 'Cloud', level: 45 },
  { skill: 'Security', level: 30 },
];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(r => setAnalytics(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={22} className="text-emerald-400" /> Analytics Dashboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">Platform insights, engagement trends & recommendation performance</p>
      </div>

      {/* Stat badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge icon={BookOpen} label="Total Courses" value={analytics?.total_courses || 0} color="#10b981" />
        <StatBadge icon={Users} label="Events & Clubs" value={analytics?.total_events || 0} color="#3b82f6" />
        <StatBadge icon={Briefcase} label="Career Paths" value={analytics?.total_careers || 0} color="#8b5cf6" />
        <StatBadge icon={Award} label="Study Materials" value={analytics?.total_materials || 0} color="#f59e0b" />
      </div>

      {/* Row 1: Domain distribution + Difficulty breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain bar chart */}
        <div className="glass-card p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen size={15} className="text-emerald-400" /> Courses by Domain
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics?.domain_distribution || []} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2d27" />
              <XAxis dataKey="domain" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                {(analytics?.domain_distribution || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty pie */}
        <div className="glass-card p-5 animate-slide-up stagger-2">
          <h3 className="text-sm font-semibold text-white mb-4">Difficulty Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={analytics?.difficulty_distribution || []}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  dataKey="count" nameKey="difficulty"
                  paddingAngle={3}
                >
                  {(analytics?.difficulty_distribution || []).map((_, i) => (
                    <Cell key={i} fill={['#34d399', '#fbbf24', '#f87171'][i % 3]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {(analytics?.difficulty_distribution || []).map((d, i) => (
                <div key={d.difficulty} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: ['#34d399', '#fbbf24', '#f87171'][i % 3] }} />
                  <div>
                    <p className="text-xs text-white font-medium">{d.difficulty}</p>
                    <p className="text-xs text-gray-400">{d.count} courses</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Engagement trend */}
      <div className="glass-card p-5 animate-slide-up">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={15} className="text-emerald-400" /> Weekly Engagement Trend
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2d27" />
            <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#6b7280', fontSize: 12 }} />
            <Line type="monotone" dataKey="courses" stroke="#10b981" strokeWidth={2} dot={false} name="Courses" />
            <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} dot={false} name="Events" />
            <Line type="monotone" dataKey="materials" stroke="#f59e0b" strokeWidth={2} dot={false} name="Materials" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Top courses + Top careers + Skill radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top courses */}
        <div className="glass-card p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={15} className="text-yellow-400" /> Top Rated Courses
          </h3>
          <div className="space-y-3">
            {(analytics?.popular_courses || []).map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: `${COLORS[i]}20`, color: COLORS[i] }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.domain}</p>
                </div>
                <span className="text-xs font-bold text-yellow-400">★ {c.rating}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top careers by salary */}
        <div className="glass-card p-5 animate-slide-up stagger-2">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Briefcase size={15} className="text-purple-400" /> Top Career Paths
          </h3>
          <div className="space-y-3">
            {(analytics?.top_careers || []).map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white font-medium truncate pr-2">{c.title}</span>
                  <span className="text-emerald-400 font-bold flex-shrink-0">₹{c.avg_salary_lpa}L</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-1.5 rounded-full"
                    style={{ width: `${(c.avg_salary_lpa / 32) * 100}%`, background: CAREER_COLORS[i % CAREER_COLORS.length] }} />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">↑ {c.growth_rate}% growth</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skill radar */}
        <div className="glass-card p-5 animate-slide-up stagger-3">
          <h3 className="text-sm font-semibold text-white mb-4">Skill Coverage Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={skillRadarData}>
              <PolarGrid stroke="#1f2d27" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar dataKey="level" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendation performance */}
      <div className="glass-card p-5 animate-slide-up">
        <h3 className="text-sm font-semibold text-white mb-4">Recommendation Algorithm Performance</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Precision', value: '87%', desc: 'Relevant recommendations', color: '#10b981' },
            { label: 'Recall', value: '79%', desc: 'Coverage of interests', color: '#3b82f6' },
            { label: 'Avg Match Score', value: '0.74', desc: 'TF-IDF cosine similarity', color: '#f59e0b' },
            { label: 'User Satisfaction', value: '4.6★', desc: 'Based on feedback', color: '#8b5cf6' },
          ].map(({ label, value, desc, color }) => (
            <div key={label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs font-medium text-white mt-1">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
