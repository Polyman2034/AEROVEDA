import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    try {
      setError(null);
      await signup(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Could not create account');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#fafaf9]">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white font-semibold text-sm flex items-center justify-center mx-auto shadow-2xs">
            AV
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
              AEROVEDA
            </h1>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">
              Create Officer Account
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200/80 text-rose-800 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Kulkarni"
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-xs font-normal text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@env.gov.in"
              required
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-xs font-normal text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition-all font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3 py-2 bg-white border border-zinc-200/80 rounded-lg text-xs font-normal text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition-all font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center shadow-2xs disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-zinc-400">
          <span>Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-zinc-800 font-medium hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
