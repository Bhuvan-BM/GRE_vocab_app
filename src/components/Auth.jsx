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

        // Basic validation
        if (!email.includes('@')) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        try {
            if (isSignup) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin
                    }
                });
                if (error) throw error;

                if (data?.user && data?.session) {
                    // Directly logged in (auto-confirm enabled)
                    onAuthChange(data.user);
                } else {
                    setError('Signup successful! Please check your email for a verification link.');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data?.user) onAuthChange(data.user);
            }
            setEmail('');
            setPassword('');
        } catch (err) {
            let msg = err.message || 'Authentication error';
            if (msg.toLowerCase().includes('rate limit')) {
                msg = 'Too many attempts. Please wait a few minutes before trying again or use a different email.';
            } else if (msg.toLowerCase().includes('invalid login credentials')) {
                msg = 'Invalid email or password. Please try again.';
            }
            setError(msg);
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
            <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <div className="text-xs md:text-sm text-gray-500">
                            Logged in: <span className="font-bold text-gray-800">{user.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-red-500 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-gray-100 hover:border-red-100"
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-b border-gray-100 p-6 md:p-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-2">
                        {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-400 text-sm italic">
                        {isSignup ? 'Join the GRE Vocab Master community' : 'Login to save your progress and weak words'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3.5 rounded-xl text-sm font-black shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Processing...' : isSignup ? 'Create Master Account' : 'Sign In Now'}
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => { setIsSignup(!isSignup); setError(''); }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                        >
                            {isSignup ? 'Already have an account? Login' : 'New here? Create an account'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className={`mt-4 p-4 rounded-xl text-sm font-medium flex items-start gap-3 animate-slide-in ${error.includes('successful')
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                        <div className="shrink-0 mt-0.5">
                            {error.includes('successful') ? '✓' : 'ℹ️'}
                        </div>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Auth;
