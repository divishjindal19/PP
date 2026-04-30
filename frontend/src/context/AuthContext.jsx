// src/context/AuthContext.jsx
// Resilient auth: stores user data locally so backend restarts don't log you out
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../api/client';

const AuthContext = createContext(null);

const DEFAULT_PROFILE = {
  id: 'demo_student',
  name: 'Alex Johnson',
  email: 'alex@university.edu',
  branch: 'Computer Science',
  year: 3,
  gpa: 3.6,
  interests: ['AI', 'Machine Learning', 'Web Dev'],
  skills: ['Python', 'React', 'SQL'],
  career_goal: 'ML Engineer',
  completed_courses: ['CS101', 'CS102', 'MATH101', 'MATH301', 'WEB101', 'DATA101'],
  avatar_url: '',
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore auth entirely from localStorage — no server round-trip needed.
    // If the session token expired on the backend we silently re-issue it
    // the next time an API call needs it (see demoLogin auto-restore below).
    try {
      const savedUser    = localStorage.getItem('uni_user');
      const savedProfile = localStorage.getItem('uni_profile');
      const savedToken   = localStorage.getItem('session_token');

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      }
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch {
      // corrupt storage — clear it
      localStorage.removeItem('uni_user');
      localStorage.removeItem('uni_profile');
      localStorage.removeItem('session_token');
    }
    setLoading(false);
  }, []);

  // Called on every API request failure with 401 — re-registers the session
  const rehydrateSession = async () => {
    try {
      const savedUser = localStorage.getItem('uni_user');
      if (!savedUser) return;
      const u = JSON.parse(savedUser);
      const res = await authAPI.demoLogin({ email: u.email, name: u.name });
      localStorage.setItem('session_token', res.data.token);
    } catch { /* silent */ }
  };

  const demoLogin = async () => {
    const res = await authAPI.demoLogin({
      email: 'alex@university.edu',
      name: 'Alex Johnson',
    });
    const { token, user: userData } = res.data;

    const p = { ...DEFAULT_PROFILE, id: token };

    localStorage.setItem('session_token', token);
    localStorage.setItem('uni_user',    JSON.stringify(userData));
    localStorage.setItem('uni_profile', JSON.stringify(p));

    setUser(userData);
    setProfile(p);
    return { token, user: userData };
  };

  const logout = async () => {
    const token = localStorage.getItem('session_token');
    if (token) authAPI.logout(token).catch(() => {});
    localStorage.removeItem('session_token');
    localStorage.removeItem('uni_user');
    localStorage.removeItem('uni_profile');
    setUser(null);
    setProfile(null);
  };

  const saveProfile = (updates) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem('uni_profile', JSON.stringify(updated));
    userAPI.saveProfile(updated).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      demoLogin, logout, saveProfile, setProfile, rehydrateSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
