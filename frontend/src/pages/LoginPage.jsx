// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Sparkles, Brain, BookOpen, TrendingUp } from 'lucide-react';

const features = [
  { icon: Brain, text: 'AI-powered course recommendations' },
  { icon: BookOpen, text: 'Personalized study materials' },
  { icon: TrendingUp, text: 'Career path guidance' },
  { icon: Sparkles, text: 'Smart semester planning' },
];

export default function LoginPage() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await demoLogin();
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-dark)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1f15 0%, #061a10 50%, #020f09 100%)' }}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glow orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">UniAdvisor</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your AI-powered<br />
            <span className="gradient-text">Academic Advisor</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Get personalized course recommendations, career guidance, and semester planning — all powered by AI.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <Icon size={15} className="text-emerald-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-6">
            {['2,400+ Courses', '500+ Students', '98% Match Rate'].map(s => (
              <div key={s} className="text-center">
                <p className="text-emerald-400 font-bold text-lg">{s.split(' ')[0]}</p>
                <p className="text-gray-500 text-xs">{s.split(' ').slice(1).join(' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">UniAdvisor</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Welcome back 👋</h1>
          <p className="text-gray-400 mb-8">Sign in to access your personalized dashboard</p>

          {/* Demo login card */}
          <div className="glass-card p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>AJ</div>
              <div>
                <p className="text-sm font-medium text-white">Alex Johnson</p>
                <p className="text-xs text-gray-400">alex@university.edu • CS Year 3</p>
              </div>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
              style={{ background: loading ? '#065f46' : 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Continue as Demo Student
                </>
              )}
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px" style={{ background: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-gray-500" style={{ background: 'var(--bg-dark)' }}>
                or sign in with Google
              </span>
            </div>
          </div>

          <button
            className="w-full py-3 rounded-xl text-sm font-medium text-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            onClick={() => alert('Configure GOOGLE_CLIENT_ID in backend .env to enable Google login')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-xs text-gray-600 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
