// src/pages/RecommendationsPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { recommendAPI, feedbackAPI } from '../api/client';
import {
  BookOpen, Calendar, FileText, Briefcase, Star,
  ExternalLink, ThumbsUp, ThumbsDown, Zap, RefreshCw
} from 'lucide-react';

const TABS = [
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'events', label: 'Events & Clubs', icon: Calendar },
  { key: 'materials', label: 'Study Materials', icon: FileText },
  { key: 'career', label: 'Career Paths', icon: Briefcase },
];

function MatchBar({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct > 70 ? '#10b981' : pct > 40 ? '#fbbf24' : '#f87171';
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{pct}% match</span>
    </div>
  );
}

function FeedbackButtons({ item, type, studentId }) {
  const [rated, setRated] = useState(null);
  const rate = async (rating) => {
    setRated(rating);
    await feedbackAPI.submit({ student_id: studentId, item_id: item.id, item_type: type, rating }).catch(() => {});
  };
  return (
    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      <span className="text-xs text-gray-500 mr-1">Helpful?</span>
      <button onClick={() => rate(5)} className={`p-1.5 rounded-lg transition-all ${rated === 5 ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}><ThumbsUp size={13} /></button>
      <button onClick={() => rate(1)} className={`p-1.5 rounded-lg transition-all ${rated === 1 ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-red-400'}`}><ThumbsDown size={13} /></button>
      {rated && <span className="text-xs text-emerald-400 ml-1">Thanks!</span>}
    </div>
  );
}

function CourseCard({ item, idx, studentId }) {
  const diffColor = { Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171' }[item.difficulty] || '#34d399';
  return (
    <div className="glass-card p-5 glow-hover animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm font-semibold text-white">{item.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{item.domain} • {item.credits} credits • Sem {item.semester}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${diffColor}15`, color: diffColor }}>{item.difficulty}</span>
      </div>
      <MatchBar score={item.match_score} />
      <p className="text-xs text-gray-400 mt-2 italic">💡 {item.reason}</p>
      <p className="text-xs text-gray-500 mt-1">{item.peer_insight}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {(item.tags || []).slice(0, 4).map(t => <span key={t} className="tag-pill">{t.trim()}</span>)}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Star size={11} className="text-yellow-400" />
        <span className="text-xs text-gray-400">{item.rating}</span>
      </div>
      <FeedbackButtons item={item} type="course" studentId={studentId} />
    </div>
  );
}

function EventCard({ item, idx, studentId }) {
  return (
    <div className="glass-card p-5 glow-hover animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{item.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{item.type} • {item.interest_area}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>{item.type}</span>
      </div>
      <MatchBar score={item.match_score} />
      <p className="text-xs text-gray-400 mt-2">{item.description}</p>
      <p className="text-xs text-gray-500 mt-1">📅 {item.date}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {(item.tags || []).slice(0, 4).map(t => <span key={t} className="tag-pill">{t.trim()}</span>)}
      </div>
      <FeedbackButtons item={item} type="event" studentId={studentId} />
    </div>
  );
}

function MaterialCard({ item, idx, studentId }) {
  const typeIcon = { Book: '📗', Course: '🎓', Video: '▶️', Notes: '📝', Practice: '💻', GitHub: '🐙', Documentation: '📄' }[item.type] || '📄';
  return (
    <div className="glass-card p-5 glow-hover animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl flex-shrink-0">{typeIcon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{item.type} • {item.domain} • {item.difficulty}</p>
        </div>
      </div>
      <MatchBar score={item.match_score} />
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          <Star size={11} className="text-yellow-400" />
          <span className="text-xs text-gray-400">{item.rating}</span>
        </div>
        {item.url && item.url !== '#' && (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
            Open <ExternalLink size={11} />
          </a>
        )}
      </div>
      <FeedbackButtons item={item} type="material" studentId={studentId} />
    </div>
  );
}

function CareerCard({ item, idx, studentId }) {
  return (
    <div className="glass-card p-5 glow-hover animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{item.domain} • {item.career_stage}</p>
        </div>
        <span className="text-lg font-bold text-emerald-400">₹{item.avg_salary_lpa}L</span>
      </div>
      <MatchBar score={item.match_score} />
      <p className="text-xs text-gray-400 mt-2">{item.description}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
        <span className="text-emerald-400">↑ {item.growth_rate}% growth</span>
      </div>
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-1">Key Skills</p>
        <div className="flex flex-wrap gap-1">
          {(item.skills_required || []).slice(0, 5).map(s => <span key={s} className="tag-pill">{s.trim()}</span>)}
        </div>
      </div>
      <p className="text-xs text-gray-400 italic mt-2">💡 {item.reason}</p>
      <FeedbackButtons item={item} type="career" studentId={studentId} />
    </div>
  );
}

export default function RecommendationsPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState('courses');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchTab = useCallback(async (t) => {
    if (data[t] || !profile) return;
    setLoading(true);
    try {
      const fn = { courses: recommendAPI.getCourses, events: recommendAPI.getEvents, materials: recommendAPI.getMaterials, career: recommendAPI.getCareer }[t];
      const res = await fn(profile);
      setData(d => ({ ...d, [t]: res.data.recommendations || [] }));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [profile, data]);

  useEffect(() => { fetchTab(tab); }, [tab]);

  const refresh = () => {
    setData(d => { const n = { ...d }; delete n[tab]; return n; });
    setTimeout(() => fetchTab(tab), 50);
  };

  const items = data[tab] || [];
  const CardMap = { courses: CourseCard, events: EventCard, materials: MaterialCard, career: CareerCard };
  const Card = CardMap[tab];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap size={22} className="text-emerald-400" /> Recommendations
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-powered picks based on your profile • {profile?.interests?.join(', ')}
          </p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-400 hover:bg-emerald-400/10 transition-all">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={tab === key
              ? { background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }
              : { color: '#6b7280' }}>
            <Icon size={15} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card h-48 animate-pulse" style={{ background: 'var(--bg-card2)' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No recommendations yet. Update your profile to get personalized picks!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <Card key={item.id} item={item} idx={i} studentId={profile?.id} />
          ))}
        </div>
      )}
    </div>
  );
}
