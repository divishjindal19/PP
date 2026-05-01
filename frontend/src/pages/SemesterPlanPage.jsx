// src/pages/SemesterPlanPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { recommendAPI } from '../api/client';
import { Calendar, BookOpen, ChevronRight, Award, Zap, Download } from 'lucide-react';

const diffColor = { Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171' };
const domainIcon = {
  'Computer Science': '💻', 'AI/ML': '🤖', 'Web Dev': '🌐',
  'Data Science': '📊', 'Mathematics': '📐', 'Finance': '💰',
  'Product': '📦', 'Design': '🎨', 'Systems': '⚙️',
  'Security': '🔒', 'Ethics': '⚖️', 'Business': '🏢', 'Communication': '💬'
};

function CourseChip({ course, index }) {
  const color = diffColor[course.difficulty] || '#34d399';
  const icon = domainIcon[course.domain] || '📚';
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl animate-slide-up"
      style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', animationDelay: `${index * 0.04}s` }}>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{course.name}</p>
        <p className="text-xs text-gray-400">{course.domain}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-semibold" style={{ color }}>{course.difficulty}</p>
        <p className="text-xs text-gray-500">{course.credits} cr</p>
      </div>
    </div>
  );
}

function SemesterCard({ semKey, semData, index }) {
  const [expanded, setExpanded] = useState(index < 2);
  const totalCr = semData.total_credits;
  const courses = semData.courses || [];
  const fillPct = Math.min((totalCr / 20) * 100, 100);

  return (
    <div className="glass-card overflow-hidden animate-slide-up glow-hover"
      style={{ animationDelay: `${index * 0.08}s` }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-5 flex items-center gap-4 text-left"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <Calendar size={18} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{semKey}</h3>
          <p className="text-xs text-gray-400">{courses.length} courses • {totalCr} credits</p>
          {/* Credit load bar */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${fillPct}%`,
                  background: totalCr > 18 ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                    : 'linear-gradient(90deg,#10b981,#34d399)'
                }} />
            </div>
            <span className="text-xs text-gray-400">{totalCr}/20 cr</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-400 transition-transform duration-200 flex-shrink-0"
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
      </button>

      {/* Course list */}
      {expanded && (
        <div className="px-5 pb-5 space-y-2">
          {courses.map((c, i) => <CourseChip key={c.id} course={c} index={i} />)}
        </div>
      )}
    </div>
  );
}

export default function SemesterPlanPage() {
  const { profile } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlan = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    try {
      const res = await recommendAPI.getSemesterPlan(profile);
      setPlan(res.data);
    } catch (e) {
      setError('Could not load semester plan. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlan(); }, [profile]);

  const semEntries = Object.entries(plan?.semester_plan || {});
  const totalCourses = semEntries.reduce((acc, [, d]) => acc + d.courses.length, 0);
  const totalCredits = semEntries.reduce((acc, [, d]) => acc + d.total_credits, 0);

  const exportPlan = () => {
    const txt = semEntries.map(([sem, data]) =>
      `\n${sem} (${data.total_credits} credits):\n` +
      data.courses.map(c => `  • ${c.name} (${c.difficulty}, ${c.credits} cr)`).join('\n')
    ).join('\n');
    const blob = new Blob([`AI SEMESTER PLAN — ${profile?.name}\nCareer Goal: ${profile?.career_goal}\n\n${txt}`], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'semester_plan.txt'; a.click();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={22} className="text-emerald-400" /> Semester Planner
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-generated plan for <span className="text-emerald-400">{profile?.career_goal || 'your career goal'}</span> •
            Prerequisite-aware • Credit-balanced
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPlan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-400/10 transition-all"
            style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
            <Download size={13} /> Export
          </button>
          <button onClick={fetchPlan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-400/10 transition-all"
            style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
            <Zap size={13} /> Regenerate
          </button>
        </div>
      </div>

      {/* Info strip */}
      {plan && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Calendar, label: 'Semesters Planned', value: plan.total_semesters_planned },
            { icon: BookOpen, label: 'Total Courses', value: totalCourses },
            { icon: Award, label: 'Total Credits', value: totalCredits },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-card p-4 text-center animate-slide-up">
              <Icon size={18} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Plan note */}
      {plan?.note && (
        <div className="mb-4 px-4 py-3 rounded-xl text-xs text-emerald-400 animate-fade-in"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
          💡 {plan.note}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-400 text-sm">Generating your personalized semester plan...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 text-red-400 text-sm">{error}</div>
      )}

      {/* Semester cards */}
      {!loading && semEntries.length > 0 && (
        <div className="space-y-4">
          {semEntries.map(([semKey, semData], i) => (
            <SemesterCard key={semKey} semKey={semKey} semData={semData} index={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && semEntries.length === 0 && (
        <div className="text-center py-20">
          <Calendar size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400 text-sm">No plan generated yet.</p>
          <p className="text-gray-500 text-xs mt-1">Make sure your profile has career goals and interests set.</p>
          <button onClick={fetchPlan}
            className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            Generate Plan
          </button>
        </div>
      )}

      {/* Legend */}
      {semEntries.length > 0 && (
        <div className="mt-6 flex items-center gap-6 text-xs text-gray-500 animate-fade-in">
          <span className="font-medium text-gray-400">Difficulty:</span>
          {Object.entries(diffColor).map(([d, c]) => (
            <span key={d} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: c }} />
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
