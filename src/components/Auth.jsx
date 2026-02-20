import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogOut } from 'lucide-react';

const Auth = ({ user, onAuthChange }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignup, setIsSignup] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignup) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setError('Signup successful! Check your email to verify.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err.message || 'Auth error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        onAuthChange(null);
    };

    if (user) {
        return (
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="text-sm">
                        Logged in as: <span className="font-semibold text-indigo-600">{user.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-200 p-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-lg font-bold mb-4 text-gray-800">
                    {isSignup ? 'Create Account' : 'Login to Save Your Progress'}
                </h2>
                <form onSubmit={handleAuth} className="flex gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="border rounded px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="border rounded px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                        {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsSignup(!isSignup); setError(''); }}
                        className="text-indigo-600 hover:underline text-sm"
                    >
                        {isSignup ? 'Login instead' : 'Create account'}
                    </button>
                </form>
                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            </div>
        </div>
    );
};

export default Auth;
