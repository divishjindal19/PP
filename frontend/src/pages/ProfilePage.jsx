// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Plus, X, User, BookOpen, Target, Zap } from 'lucide-react';

const INTEREST_OPTIONS = ['AI', 'Machine Learning', 'Web Dev', 'Data Science', 'Cybersecurity',
  'Finance', 'Product Management', 'Design', 'Cloud', 'Blockchain', 'Entrepreneurship'];
const SKILL_OPTIONS = ['Python', 'JavaScript', 'React', 'SQL', 'Java', 'C++', 'Node.js',
  'TensorFlow', 'PyTorch', 'Docker', 'AWS', 'Figma', 'Excel'];
const CAREER_GOALS = ['ML Engineer', 'Data Scientist', 'Full Stack Developer', 'Product Manager',
  'Cybersecurity Analyst', 'Investment Banker', 'UX Designer', 'DevOps Engineer',
  'Research Scientist', 'Quantitative Analyst', 'Blockchain Developer', 'Cloud Architect'];
const BRANCHES = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Finance', 'Business Administration', 'Design'];

function ChipSelector({ label, options, selected, onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(s => s !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} type="button"
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
            style={selected.includes(opt)
              ? { background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)' }
              : { background: 'var(--bg-card2)', color: '#9ca3af', border: '1px solid var(--border)' }
            }>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, saveProfile } = useAuth();
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User size={22} className="text-emerald-400" /> My Profile
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Keep your profile updated for better AI recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="glass-card p-6 flex flex-col items-center text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            {(form.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <h2 className="text-lg font-semibold text-white">{form.name}</h2>
          <p className="text-sm text-gray-400">{form.email}</p>
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-sm" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span className="text-gray-400">Branch</span>
              <span className="text-white font-medium">{form.branch}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span className="text-gray-400">Year</span>
              <span className="text-white font-medium">Year {form.year}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">GPA</span>
              <span className="text-emerald-400 font-bold">{form.gpa} / 4.0</span>
            </div>
          </div>
        </div>

        {/* Main form */}
        <div className="lg:col-span-2 space-y-5 animate-slide-up stagger-2">
          {/* Basic info */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <User size={15} className="text-emerald-400" /> Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                <input value={form.name || ''} onChange={e => update('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none focus:border-emerald-500"
                  style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Branch</label>
                <select value={form.branch || ''} onChange={e => update('branch', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Year</label>
                <select value={form.year || 1} onChange={e => update('year', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }}>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">GPA (0–4.0)</label>
                <input type="number" min="0" max="4" step="0.1" value={form.gpa || 3.0}
                  onChange={e => update('gpa', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)' }} />
              </div>
            </div>
          </div>

          {/* Career goal */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Target size={15} className="text-emerald-400" /> Career Goal
            </h3>
            <div className="flex flex-wrap gap-2">
              {CAREER_GOALS.map(goal => (
                <button key={goal} onClick={() => update('career_goal', goal)} type="button"
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={form.career_goal === goal
                    ? { background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)' }
                    : { background: 'var(--bg-card2)', color: '#9ca3af', border: '1px solid var(--border)' }
                  }>
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen size={15} className="text-emerald-400" /> Interests
            </h3>
            <ChipSelector
              label="Select all that apply"
              options={INTEREST_OPTIONS}
              selected={form.interests || []}
              onChange={v => update('interests', v)}
            />
          </div>

          {/* Skills */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={15} className="text-emerald-400" /> Skills
            </h3>
            <ChipSelector
              label="Technologies you know"
              options={SKILL_OPTIONS}
              selected={form.skills || []}
              onChange={v => update('skills', v)}
            />
          </div>

          {/* Save button */}
          <button onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200"
            style={{ background: saved ? '#065f46' : 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Save size={16} />
            {saved ? '✓ Profile Saved!' : 'Save Profile & Update Recommendations'}
          </button>
        </div>
      </div>
    </div>
  );
}
