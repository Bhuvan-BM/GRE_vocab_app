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
        <>
            {user ? (
                <>
                    <Auth user={user} onAuthChange={setUser} />
                    <VocabStudyApp user={user} />
                </>
            ) : (
                <>
                    <Auth user={null} onAuthChange={setUser} />
                    <div className="flex items-center justify-center h-screen bg-gray-50">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to GRE Vocab Master</h2>
                            <p className="text-gray-600">Please login or create an account to get started.</p>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default AppWithAuth;
