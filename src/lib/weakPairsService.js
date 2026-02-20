import { supabase } from './supabaseClient';

// Fetch all weak pairs for the logged-in user
export const fetchWeakPairs = async (userId) => {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('weak_pairs')
        .select('*')
        .eq('user_id', userId)
        .order('last_seen', { ascending: false });

    if (error) {
        console.error('Error fetching weak pairs:', error);
        return [];
    }
    return data || [];
};

// Add or update a weak pair
export const saveWeakPair = async (userId, word1, word2, word1Info, word2Info, reason) => {
    if (!userId) return null;

    const pairKey = [word1, word2].sort().join('|');

    // Check if pair already exists
    const { data: existing } = await supabase
        .from('weak_pairs')
        .select('id, attempts, correct_streak')
        .eq('user_id', userId)
        .eq('word1', word1)
        .eq('word2', word2)
        .single();

    if (existing) {
        // Update existing
        const { error } = await supabase
            .from('weak_pairs')
            .update({
                attempts: existing.attempts + 1,
                last_seen: new Date().toISOString(),
            })
            .eq('id', existing.id);
        if (error) console.error('Error updating weak pair:', error);
    } else {
        // Insert new
        const { error } = await supabase
            .from('weak_pairs')
            .insert({
                user_id: userId,
                word1,
                word2,
                word1_info: word1Info,
                word2_info: word2Info,
                reason,
                attempts: 1,
                correct_streak: 0,
                last_seen: new Date().toISOString(),
            });
        if (error) console.error('Error saving weak pair:', error);
    }
};

// Remove weak pair (after 3 correct streaks)
export const removeWeakPair = async (word1, word2) => {
    const { error } = await supabase
        .from('weak_pairs')
        .delete()
        .eq('word1', word1)
        .eq('word2', word2);
    if (error) console.error('Error deleting weak pair:', error);
};

// Update correct streak
export const updateCorrectStreak = async (userId, word1, word2) => {
    if (!userId) return;

    const { data: existing } = await supabase
        .from('weak_pairs')
        .select('id, correct_streak')
        .eq('user_id', userId)
        .eq('word1', word1)
        .eq('word2', word2)
        .single();

    if (existing) {
        const newStreak = existing.correct_streak + 1;
        if (newStreak >= 3) {
            // Remove from weak pairs
            await supabase.from('weak_pairs').delete().eq('id', existing.id);
        } else {
            // Update streak
            await supabase
                .from('weak_pairs')
                .update({ correct_streak: newStreak, last_seen: new Date().toISOString() })
                .eq('id', existing.id);
        }
    }
};

// Clear all weak pairs for user
export const clearAllWeakPairs = async (userId) => {
    if (!userId) return;
    const { error } = await supabase
        .from('weak_pairs')
        .delete()
        .eq('user_id', userId);
    if (error) console.error('Error clearing weak pairs:', error);
};
