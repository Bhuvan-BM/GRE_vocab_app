import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Auth from './components/Auth';
import VocabStudyApp from './GRE_Vocab_Complete_App_FINAL';

const AppWithAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription?.unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Auth user={user} onAuthChange={setUser} />

            {!user ? (
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
                        <div className="bg-indigo-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">GRE Vocab Master</h2>
                        <p className="text-gray-500 leading-relaxed mb-0">Master 1100+ high-frequency words with active recall, visual clusters, and smart spaced repetition.</p>
                        <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center gap-8">
                            <div className="text-center">
                                <div className="text-xl font-black text-indigo-600">1100+</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Words</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-black text-purple-600">Smart</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-black text-emerald-600">Visual</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clustering</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <VocabStudyApp user={user} />
            )}
        </div>
    );
};

export default AppWithAuth;
