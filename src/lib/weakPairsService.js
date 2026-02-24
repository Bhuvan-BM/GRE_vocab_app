import { supabase } from './supabaseClient';
import clusterHelpers from './clusterHelpers';

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

    // Normalize row keys to camelCase expected by UI
    const normalized = (row) => ({
        ...row,
        id: row.id,
        userId: row.user_id ?? row.userId,
        word1: row.word1,
        word2: row.word2,
        word1Info: row.word1_info ?? row.word1Info ?? null,
        word2Info: row.word2_info ?? row.word2Info ?? null,
        attempts: row.attempts ?? 0,
        correctStreak: row.correct_streak ?? row.correctStreak ?? 0,
        lastSeen: row.last_seen ?? row.lastSeen ?? null,
        reason: row.reason ?? row.reason
    });

    return (data || []).map(normalized);
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

// Generate in-memory weak pair candidates using cluster heuristics
export const getWeakPairCandidates = (maxPairs = 200) => {
    return clusterHelpers.buildWeakPairCandidates(maxPairs);
};
