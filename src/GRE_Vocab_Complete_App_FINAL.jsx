import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, BookOpen, AlertCircle, ChevronDown, ChevronRight, Eye, Brain, TrendingDown, Edit3, Volume2, X, PlayCircle } from 'lucide-react';
import { fetchWeakPairs, saveWeakPair, updateCorrectStreak, clearAllWeakPairs } from './lib/weakPairsService';
import GRE_CLUSTERS, { GRE_WORDS } from './lib/greClusters';
import clusterHelpers from './lib/clusterHelpers';

// Use parsed cluster data generated from GRE_Clusters_All_Words_Final.md
const CLUSTER_TREE = GRE_CLUSTERS;

// Synonym groups for the practice quiz
const SYNONYM_GROUPS = CLUSTER_TREE.flatMap(cluster =>
    cluster.subClusters.map(sub => ({
        clusterId: cluster.id,
        words: sub.words,
        meaning: sub.name
    }))
).filter(group => group.words.length >= 2);

// Distractor words (use all parsed words as potential distractors)
const DISTRACTOR_WORDS = GRE_WORDS.map(w => w.text);

// ---------- Pronunciation Helper (Web Speech API) ----------
const speakWord = (text) => {
    if (!('speechSynthesis' in window)) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Try to find a high-quality English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB')) || voices[0];

    if (englishVoice) utterance.voice = englishVoice;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
};

// Use helper lookup for word info (cluster/subcluster + synonyms)
const getWordInfo = (word) => {
    return clusterHelpers.getWordInfo(word);
};


// Component for displaying detailed word information
const WordDetailCard = ({ word, wordInfo }) => {
    if (!wordInfo || !wordInfo.meaning) return null;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-lg p-4 mt-3">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="text-lg font-bold text-indigo-900">{word}</div>
                    <div className="text-sm text-indigo-700 mt-1">
                        📚 {wordInfo.cluster}
                    </div>
                    <div className="text-sm text-indigo-600">
                        📂 {wordInfo.subCluster}
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Meaning:</div>
                <div className="text-sm text-gray-800 font-medium italic">
                    "{wordInfo.meaning}"
                </div>
            </div>

            {wordInfo.synonyms && wordInfo.synonyms.length > 0 && (
                <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
                        Correct Pairs (Synonyms):
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {wordInfo.synonyms.map((syn, idx) => (
                            <span
                                key={idx}
                                className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold border border-green-300"
                            >
                                {word} + {syn}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Compact/detail view used for Weak Pairs formatting per user request
const WeakWordDetail = ({ word, wordInfo }) => {
    if (!wordInfo || !wordInfo.meaning) {
        return (
            <div className="text-sm text-gray-800">
                <div className="text-lg font-bold mb-2 text-red-600">{word}</div>
                <div className="text-sm italic text-gray-600">This word is not in the GRE 1100-word list.</div>
                <div className="mt-3">
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(word)}+meaning+GRE+synonyms`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold"
                    >
                        Search on Google
                    </a>
                </div>
            </div>
        );
    }

    const synonyms = wordInfo.synonyms || [];
    return (
        <div className="text-sm text-gray-800">
            <div className="text-lg font-bold mb-1">{word}</div>
            <div className="text-xs font-semibold text-gray-600">Meaning:</div>
            <div className="text-sm italic">"{wordInfo.meaning}"</div>
            <div className="text-xs font-semibold text-gray-600 mt-2">Correct Pairs (Synonyms):</div>
            <div className="text-sm">{synonyms.length > 0 ? synonyms.join(', ') : '—'}</div>
        </div>
    );
};

// ---------- Visual Tree Theme Palette - Disciplined & Minimalist ----------
const CLUSTER_THEMES = [
    { name: 'Sky', border: 'border-sky-300', text: 'text-sky-600', icon: 'text-sky-500', bg: 'bg-sky-50' },
    { name: 'Emerald', border: 'border-emerald-300', text: 'text-emerald-600', icon: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Rose', border: 'border-rose-300', text: 'text-rose-600', icon: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Amber', border: 'border-amber-300', text: 'text-amber-600', icon: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Violet', border: 'border-violet-300', text: 'text-violet-600', icon: 'text-violet-500', bg: 'bg-violet-50' },
    { name: 'Orange', border: 'border-orange-300', text: 'text-orange-600', icon: 'text-orange-500', bg: 'bg-orange-50' },
    { name: 'Indigo', border: 'border-indigo-300', text: 'text-indigo-600', icon: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Lime', border: 'border-lime-300', text: 'text-lime-600', icon: 'text-lime-500', bg: 'bg-lime-50' },
];

// ---------- WordFlipCard Component ----------
const WordFlipCard = ({ word, meaning, theme, isWeak, isHighlighted, studyMode, isPrimary, disabled, onClick }) => {
    const handleSpeak = (e) => {
        e.stopPropagation();
        speakWord(word);
    };

    return (
        <div
            className={`flip-card w-28 h-12 flex items-center justify-center p-1 relative rounded-lg border shadow-sm transition-all group/card ${isHighlighted && !disabled ? 'search-highlight-trigger' : ''
                } ${disabled ? 'opacity-40 grayscale-0 pointer-events-none' : 'hover:scale-105 active:scale-95'} ${isWeak ? 'bg-red-50 border-red-300 shadow-red-100' : 'bg-white border-gray-100'
                } ${isPrimary ? 'border-l-4 border-l-indigo-500' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                    speakWord(word);
                    onClick();
                }
            }}
        >
            <div className="flex flex-col items-center justify-center w-full px-1">
                <span className={`text-[13px] font-bold truncate w-center transition-all duration-300 ${isWeak ? 'text-red-700' : 'text-gray-800'
                    } ${studyMode ? 'blur-[3px] group-hover/card:blur-0 opacity-20 group-hover/card:opacity-100' : ''}`}>
                    {word}
                </span>
                <div className="flex items-center gap-1 mt-0.5" onClick={handleSpeak}>
                    <Volume2 size={10} className={isWeak ? 'text-red-400' : 'text-gray-400'} />
                    <span className="text-[8px] text-gray-400 font-medium uppercase tracking-tighter">Listen</span>
                </div>
            </div>
            {isWeak && <span className="weak-badge">!</span>}
            {isPrimary && !studyMode && <span className="absolute -top-1 -left-1 bg-indigo-500 text-white text-[6px] font-black px-1 rounded-sm uppercase tracking-tighter shadow-md">Anchor</span>}
        </div>
    );
};

// ---------- WordPopover Component ----------
const WordPopover = ({ word, wordInfo, theme, onClose, onQuiz }) => {
    if (!word) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px]" onClick={onClose}>
            <div
                className={`popover-card bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`p-6 border-b border-gray-50 bg-white`}>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-2xl font-black text-gray-800 tracking-tight`}>{word}</h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); speakWord(word); }}
                                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-indigo-500"
                                title="Listen to pronunciation"
                            >
                                <Volume2 size={20} />
                            </button>
                        </div>
                        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Meaning</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {wordInfo.meaning}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Synonyms ({wordInfo.synonyms.length})</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {wordInfo.synonyms.map((s, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100 text-[11px] font-bold`}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onQuiz}
                            className={`w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-sm active:scale-[0.98] ${theme.text.replace('text-', 'bg-').replace('600', '500')
                                } hover:brightness-110`}
                        >
                            Quick Quiz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ---------- Semantic Icons Map ----------
const GROUP_ICONS = {
    1: '✨', 2: '🚫', 3: '🌿', 4: '👑', 5: '🧱', 6: '🎭', 7: '⌛', 8: '🔥', 9: '🧩', 10: '⚔️',
    11: '🗣️', 12: '🦥', 13: '🔬', 14: '🎯', 15: '🛡️', 16: '🌊', 17: '💢', 18: '🔍', 19: '🗑️', 20: '🎗️',
    21: '📜', 22: '🕵️', 23: '👶', 24: '💰', 25: '🦁', 26: '⚖️', 27: '🎉', 28: '🌧️', 29: '🤬', 30: '⚖️',
    31: '🎋', 32: '🎨', 33: '👯', 34: '🥱', 35: '☢️', 36: '🍎', 37: '🧘', 38: '📢', 39: '🤫', 40: '🏃',
    default: '📚'
};

// Component for Visual Cluster Tree
const ClusterTreeView = ({ weakWords = new Set(), weakPairs = [], searchQuery = '', onStartQuiz }) => {
    const [expandedClusters, setExpandedClusters] = useState(new Set([1, 2, 3]));
    const [selectedWord, setSelectedWord] = useState(null);
    const [studyMode, setStudyMode] = useState(false);

    // Calculate progression for a group
    const getGroupMastery = (cluster) => {
        const allWords = cluster.subClusters.flatMap(sc => sc.words).map(w => w.toLowerCase());
        const groupWeak = allWords.filter(w => weakWords.has(w));

        // Find mastery (correct streak >= 3 from weakPairs if it exists there)
        // This is a bit complex since weakPairs only has words that WERE weak
        // Let's just use weak status for now for the progress bar
        return {
            total: allWords.length,
            weak: groupWeak.length,
            mastered: 0 // Placeholder until we have full word history
        };
    };

    const toggleCluster = (clusterId) => {
        const newExpanded = new Set(expandedClusters);
        if (newExpanded.has(clusterId)) {
            newExpanded.delete(clusterId);
        } else {
            newExpanded.add(clusterId);
        }
        setExpandedClusters(newExpanded);
    };

    const expandAll = () => setExpandedClusters(new Set(CLUSTER_TREE.map(c => c.id)));
    const collapseAll = () => setExpandedClusters(new Set());

    // Sort words: weak words first within each subcluster
    const sortedWords = (words) => {
        return [...words].sort((a, b) => {
            const aWeak = weakWords.has(a.toLowerCase()) ? 0 : 1;
            const bWeak = weakWords.has(b.toLowerCase()) ? 0 : 1;
            return aWeak - bWeak;
        });
    };

    const clusterHasWeakWords = (cluster) => {
        return cluster.subClusters.some(sc =>
            sc.words.some(w => weakWords.has(w.toLowerCase()))
        );
    };

    const sortedClusters = [...CLUSTER_TREE].sort((a, b) => {
        const aHas = clusterHasWeakWords(a) ? 0 : 1;
        const bHas = clusterHasWeakWords(b) ? 0 : 1;
        return aHas - bHas;
    });

    useEffect(() => {
        if (weakWords.size > 0 || searchQuery) {
            const relevantIds = CLUSTER_TREE
                .filter(c => {
                    const hasWeak = clusterHasWeakWords(c);
                    const hasSearch = searchQuery && c.subClusters.some(sc =>
                        sc.words.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                    return hasWeak || hasSearch;
                })
                .map(c => c.id);

            if (relevantIds.length > 0) {
                setExpandedClusters(prev => {
                    const next = new Set(prev);
                    relevantIds.forEach(id => next.add(id));
                    return next;
                });
            }
        }
    }, [weakWords.size, searchQuery]);

    return (
        <div className="bg-white rounded-2xl p-4 md:p-8 transition-all">
            {/* Popover Detail Modal */}
            {selectedWord && (
                <WordPopover
                    word={selectedWord}
                    wordInfo={getWordInfo(selectedWord)}
                    theme={CLUSTER_THEMES[(CLUSTER_TREE.find(c => c.subClusters.some(sc => sc.words.includes(selectedWord)))?.id || 1) % CLUSTER_THEMES.length]}
                    onClose={() => setSelectedWord(null)}
                    onQuiz={() => {
                        console.log("Quiz for:", selectedWord);
                        setSelectedWord(null);
                    }}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-50 pb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Brain className="text-slate-400 shrink-0" size={24} />
                        Vocabulary Network
                    </h2>
                    <p className="text-gray-400 text-xs md:text-sm mt-0.5 italic">Visual concept clusters for easier memorization</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setStudyMode(!studyMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${studyMode
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}
                    >
                        <Eye size={14} className={studyMode ? 'text-white' : 'text-indigo-500'} />
                        {studyMode ? 'Ghost Mode: ON' : 'Active Recall (HIDDEN)'}
                    </button>
                    <div className="h-6 w-[1px] bg-gray-100 mx-1 hidden md:block"></div>
                    <button
                        onClick={expandAll}
                        className="text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-transparent hover:border-slate-100"
                    >
                        Expand All
                    </button>
                    <button
                        onClick={collapseAll}
                        className="text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-transparent hover:border-slate-100"
                    >
                        Compress All
                    </button>
                </div>
            </div>

            <div className={`space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar ${selectedWord ? 'pointer-events-none' : ''}`}>
                {sortedClusters.map((cluster) => {
                    const isExpanded = expandedClusters.has(cluster.id);
                    const hasWeak = clusterHasWeakWords(cluster);
                    const theme = CLUSTER_THEMES[cluster.id % CLUSTER_THEMES.length];
                    const mastery = getGroupMastery(cluster);
                    const groupIcon = GROUP_ICONS[cluster.id] || GROUP_ICONS.default;

                    return (
                        <div key={cluster.id} className={`rounded-xl border transition-all ${isExpanded ? 'border-gray-100 bg-slate-50/30' : 'border-transparent'}`}>
                            {/* Cluster Header - minimalist accent */}
                            <div className={`group flex items-center bg-white rounded-xl border transition-all ${isExpanded ? 'border-gray-100 shadow-sm' : 'border-gray-50 hover:border-gray-100'
                                } ${hasWeak ? 'border-red-100' : ''}`}>
                                <button
                                    onClick={() => toggleCluster(cluster.id)}
                                    className="flex-1 p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                            <ChevronRight size={16} className="text-gray-300" />
                                        </div>
                                        <div className="text-2xl mr-1">{groupIcon}</div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-700">Group {cluster.id}: {cluster.name}</span>
                                                {hasWeak && (
                                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded">
                                                        Review
                                                    </span>
                                                )}
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="flex items-center gap-1 mt-1.5 w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-400"
                                                    style={{ width: `${(mastery.weak / mastery.total) * 100}%` }}
                                                />
                                                <div
                                                    className="h-full bg-indigo-500"
                                                    style={{ width: `${(mastery.mastered / mastery.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight hidden sm:block">
                                        {cluster.subClusters.length} sections
                                    </span>
                                </button>

                                {/* Quiz Button */}
                                <div className="pr-4 py-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartQuiz(cluster.id);
                                        }}
                                        className="p-2 hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-lg transition-colors group/quiz"
                                        title="Practice this group"
                                    >
                                        <PlayCircle size={20} className="group-hover/quiz:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Sub-clusters */}
                            {isExpanded && (
                                <div className="p-3 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in bg-slate-50/50">
                                    {cluster.subClusters.map((subCluster, idx) => {
                                        const ordered = sortedWords(subCluster.words);
                                        return (
                                            <div key={idx} className={`subcluster-card bg-white border border-gray-100 rounded-xl p-3 md:p-4 shadow-sm`}>
                                                <div className={`flex items-center gap-2 mb-3 border-b border-gray-50 pb-2`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${theme.icon.replace('text-', 'bg-')}`} />
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{subCluster.name}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {ordered.map((word, wordIdx) => {
                                                        const isWordWeak = weakWords.has(word.toLowerCase());
                                                        const isWordHighlighted = searchQuery && word.toLowerCase().includes(searchQuery.toLowerCase());
                                                        const isPrimary = wordIdx === 0;

                                                        return (
                                                            <WordFlipCard
                                                                key={wordIdx}
                                                                word={word}
                                                                meaning={subCluster.name}
                                                                theme={theme}
                                                                isWeak={isWordWeak}
                                                                isHighlighted={isWordHighlighted}
                                                                studyMode={studyMode}
                                                                isPrimary={isPrimary}
                                                                disabled={!!selectedWord}
                                                                onClick={() => setSelectedWord(word)}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ---------- Fuzzy meaning matching helpers ----------
const stopWords = new Set(['a', 'an', 'the', 'to', 'of', 'in', 'for', 'and', 'or', 'is', 'are', 'be', 'with', 'on', 'at', 'by', 'it', 'as', 'but', 'not', 'very', 'too', 'so', 'do', 'does', 'did', 'has', 'have', 'had']);

const tokenize = (str) => {
    return (str || '').toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 0 && !stopWords.has(t));
};

const wordOverlapScore = (a, b) => {
    const tokensA = tokenize(a);
    const tokensB = tokenize(b);
    if (tokensA.length === 0 || tokensB.length === 0) return 0;
    let matches = 0;
    tokensA.forEach(ta => {
        if (tokensB.some(tb => tb === ta || tb.startsWith(ta) || ta.startsWith(tb))) matches++;
    });
    return matches / Math.max(tokensA.length, tokensB.length);
};

const judgeMeaning = (userMeaning, canonical) => {
    const score = wordOverlapScore(userMeaning, canonical);
    if (score >= 0.6) return 'correct';
    if (score >= 0.3) return 'close';
    return 'incorrect';
};

// ---------- RecallQuiz Component ----------
const RecallQuiz = () => {
    const [targetWord, setTargetWord] = useState(null);
    const [trueSynonyms, setTrueSynonyms] = useState([]);
    const [canonicalMeaning, setCanonicalMeaning] = useState('');
    const [meaningInput, setMeaningInput] = useState('');
    const [pairsInput, setPairsInput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [recallScore, setRecallScore] = useState({ correct: 0, total: 0 });

    const pickNewWord = () => {
        setFeedback(null);
        setMeaningInput('');
        setPairsInput('');

        // Pick a random group that has at least 2 words (so there's at least 1 synonym)
        const eligible = SYNONYM_GROUPS.filter(g => g.words.length >= 2);
        const group = eligible[Math.floor(Math.random() * eligible.length)];
        const word = group.words[Math.floor(Math.random() * group.words.length)];
        const synonyms = group.words.filter(w => w.toLowerCase() !== word.toLowerCase());

        setTargetWord(word);
        setTrueSynonyms(synonyms);
        setCanonicalMeaning(group.meaning);
    };

    useEffect(() => { pickNewWord(); }, []);

    const handleSubmit = () => {
        if (!targetWord) return;

        // --- Meaning check ---
        const meaningVerdict = judgeMeaning(meaningInput.trim(), canonicalMeaning);

        // --- Pairs check ---
        const userPairs = pairsInput
            .split(',')
            .map(w => w.trim().toLowerCase())
            .filter(w => w.length > 0);

        const trueSet = new Set(trueSynonyms.map(w => w.toLowerCase()));
        const userSet = new Set(userPairs);

        const correctWords = userPairs.filter(w => trueSet.has(w));
        const extraWords = userPairs.filter(w => !trueSet.has(w));
        const missedWords = trueSynonyms.filter(w => !userSet.has(w.toLowerCase()));

        const allPairsCorrect = correctWords.length === trueSynonyms.length && extraWords.length === 0;
        const perfect = meaningVerdict === 'correct' && allPairsCorrect;

        setRecallScore(prev => ({
            correct: prev.correct + (perfect ? 1 : 0),
            total: prev.total + 1
        }));

        setFeedback({
            meaningVerdict,
            correctWords,
            extraWords,
            missedWords
        });
    };

    if (!targetWord) return <div className="text-center py-12">Loading…</div>;

    const accuracy = recallScore.total > 0 ? Math.round((recallScore.correct / recallScore.total) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Mini score bar */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Recall Score: <span className="font-bold text-indigo-700">{recallScore.correct}/{recallScore.total}</span>
                    {recallScore.total > 0 && (
                        <span className="ml-3 text-green-700 font-semibold">({accuracy}%)</span>
                    )}
                </div>
            </div>

            {/* Target word card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="text-sm uppercase tracking-wider text-gray-500 mb-2">What does this word mean?</div>
                    <div className="text-4xl font-extrabold text-indigo-800 tracking-wide">{targetWord}</div>
                </div>

                {/* Meaning input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📖 Meaning <span className="text-gray-400 font-normal">(1–3 words)</span>
                    </label>
                    <input
                        type="text"
                        value={meaningInput}
                        onChange={e => setMeaningInput(e.target.value)}
                        placeholder='e.g. "calm down" or "praise highly"'
                        disabled={!!feedback}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors disabled:bg-gray-100"
                    />
                </div>

                {/* Pair words input */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🔗 Pair Words / Synonyms <span className="text-gray-400 font-normal">(comma-separated)</span>
                    </label>
                    <input
                        type="text"
                        value={pairsInput}
                        onChange={e => setPairsInput(e.target.value)}
                        placeholder='e.g. "copious, profuse, plentiful, abundant"'
                        disabled={!!feedback}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors disabled:bg-gray-100"
                    />
                </div>

                {/* Submit / Next */}
                <div className="flex justify-center gap-4">
                    {!feedback ? (
                        <button
                            onClick={handleSubmit}
                            disabled={meaningInput.trim().length === 0 && pairsInput.trim().length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center gap-2 transition-colors"
                        >
                            <Trophy size={20} />
                            Check Answer
                        </button>
                    ) : (
                        <button
                            onClick={pickNewWord}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center gap-2 transition-colors"
                        >
                            <RotateCcw size={20} />
                            Next Word
                        </button>
                    )}
                </div>
            </div>

            {/* Feedback block */}
            {feedback && (
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-5">
                    <h3 className="text-xl font-bold text-gray-800">Feedback</h3>

                    {/* Meaning result */}
                    <div className={`border-l-4 p-4 rounded ${feedback.meaningVerdict === 'correct'
                        ? 'bg-green-50 border-green-500'
                        : feedback.meaningVerdict === 'close'
                            ? 'bg-yellow-50 border-yellow-500'
                            : 'bg-red-50 border-red-500'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                            {feedback.meaningVerdict === 'correct' && <CheckCircle className="text-green-600" size={20} />}
                            {feedback.meaningVerdict === 'close' && <AlertCircle className="text-yellow-600" size={20} />}
                            {feedback.meaningVerdict === 'incorrect' && <XCircle className="text-red-600" size={20} />}
                            <span className={`font-bold ${feedback.meaningVerdict === 'correct' ? 'text-green-800'
                                : feedback.meaningVerdict === 'close' ? 'text-yellow-800'
                                    : 'text-red-800'
                                }`}>
                                Meaning: {feedback.meaningVerdict === 'correct' ? 'Correct!' : feedback.meaningVerdict === 'close' ? 'Close!' : 'Incorrect'}
                            </span>
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                            Canonical meaning: <em className="font-semibold">"{canonicalMeaning}"</em>
                        </div>
                    </div>

                    {/* Pair words result */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700">Pair Words Result</h4>

                        {/* Correct */}
                        {feedback.correctWords.length > 0 && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                <div className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1">
                                    <CheckCircle size={16} /> Correct ({feedback.correctWords.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.correctWords.map((w, i) => (
                                        <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold border border-green-300">{w}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Missed */}
                        {feedback.missedWords.length > 0 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                                <div className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-1">
                                    <AlertCircle size={16} /> Missed ({feedback.missedWords.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.missedWords.map((w, i) => (
                                        <span key={i} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-300">{w}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Extra / Wrong */}
                        {feedback.extraWords.length > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                <div className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1">
                                    <XCircle size={16} /> Extra / Wrong ({feedback.extraWords.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.extraWords.map((w, i) => (
                                        <span key={i} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold border border-red-300">{w}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Full correct answer */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <div className="text-sm font-bold text-blue-800 mb-2">Full Correct Synonym List</div>
                            <div className="flex flex-wrap gap-2">
                                {trueSynonyms.map((w, i) => (
                                    <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold border border-blue-300">{w}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ---------- WeakWordChip Component ----------
const WeakWordChip = ({ word, streak, isGraduating, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border whitespace-nowrap transition-all ${isGraduating
                ? 'bg-yellow-100 text-yellow-700 border-yellow-300 animate-slide-in'
                : 'bg-red-100 text-red-700 border-red-300 animate-slide-in'
                }`}
        >
            <span>{word}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isGraduating
                ? 'bg-yellow-200 text-yellow-800'
                : 'bg-red-200 text-red-800'
                }`}>
                {streak}/3
            </span>
        </button>
    );
};

// ---------- QuickReview Component ----------
const QuickReview = ({ targetWord, wordInfo, onClose }) => {
    if (!wordInfo) return null;
    const synonyms = wordInfo.synonyms || [];

    return (
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-5 mb-4 animate-slide-in shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-indigo-50 pb-2">
                <div className="font-extrabold text-indigo-900 text-xl tracking-tight">
                    {targetWord}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <XCircle size={20} />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Meaning</div>
                    <div className="text-gray-800 font-medium italic leading-relaxed">
                        "{wordInfo.meaning}"
                    </div>
                </div>

                {synonyms.length > 0 && (
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Related Words</div>
                        <div className="flex flex-wrap gap-2">
                            {synonyms.map((syn, idx) => (
                                <span
                                    key={idx}
                                    className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded text-xs font-bold border border-slate-100"
                                >
                                    {syn}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <button
                onClick={onClose}
                className="w-full mt-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-2 rounded-lg text-xs transition-colors"
            >
                DONE REVIEWING
            </button>
        </div>
    );
};

// ---------- WeakStrip Component ----------
const WeakStrip = ({ weakPairs, onResult }) => {
    const [activeChip, setActiveChip] = useState(null);

    if (!weakPairs || weakPairs.length === 0) return null;

    // Extract unique weak words from pairs
    const chipWords = [];
    const seen = new Set();
    weakPairs.forEach(pair => {
        [pair.word1, pair.word2].forEach(w => {
            const lower = w.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                chipWords.push({
                    word: w,
                    streak: pair.correctStreak || 0,
                    isGraduating: (pair.correctStreak || 0) >= 2
                });
            }
        });
    });

    if (chipWords.length === 0) return null;

    const activeWordInfo = activeChip ? getWordInfo(activeChip) : null;

    return (
        <div className="mb-4">
            <div className="bg-white rounded-lg shadow p-3">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Weak Words</span>
                    <span className="text-xs text-gray-400">({chipWords.length})</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 weak-strip">
                    {chipWords.slice(0, 20).map((chip, i) => (
                        <WeakWordChip
                            key={i}
                            word={chip.word}
                            streak={chip.streak}
                            isGraduating={chip.isGraduating}
                            onClick={() => setActiveChip(activeChip === chip.word ? null : chip.word)}
                        />
                    ))}
                </div>
            </div>

            {/* QuickReview for tapped chip */}
            {activeChip && activeWordInfo && (
                <QuickReview
                    targetWord={activeChip}
                    wordInfo={activeWordInfo}
                    onClose={() => setActiveChip(null)}
                />
            )}
        </div>
    );
};

// Main App Component
const VocabStudyApp = ({ user }) => {
    const [currentView, setCurrentView] = useState('practice'); // 'practice', 'tree', 'weak', 'recall'
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedWords, setSelectedWords] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [pairResults, setPairResults] = useState([]);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [weakPairs, setWeakPairs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const [groupFilter, setGroupFilter] = useState(null);

    // Load weak pairs from Supabase on mount or when user changes
    useEffect(() => {
        if (user?.id) {
            const loadPairs = async () => {
                const pairs = await fetchWeakPairs(user.id);
                setWeakPairs(pairs);
            };
            loadPairs();
        }
    }, [user?.id]);

    useEffect(() => {
        if (currentView === 'practice') {
            generateQuestion();
        }
    }, [currentView]);

    const generateQuestion = (filterId = null) => {
        setSelectedWords([]);
        setShowFeedback(false);
        setPairResults([]);

        const activeFilter = filterId !== null ? filterId : groupFilter;

        const isLockdown = weakPairs.length >= 30 && activeFilter === null;
        const numPairs = activeFilter !== null ? 2 : Math.floor(Math.random() * 3) + 1;
        const questionWords = [];
        const correctPairs = [];

        if (isLockdown) {
            // LOCKDOWN MODE: Pick pairs exclusively from weakPairs
            const shuffledWeak = [...weakPairs].sort(() => Math.random() - 0.5);
            const selectedWeak = shuffledWeak.slice(0, numPairs);

            selectedWeak.forEach(pair => {
                questionWords.push(pair.word1, pair.word2);
                correctPairs.push({
                    words: [pair.word1, pair.word2],
                    meaning: pair.word1Info?.meaning || pair.word2Info?.meaning || 'Mastery Review'
                });
            });
        } else {
            // NORMAL MODE: Prioritize weak words if they exist (70% chance to include at least one weak pair)
            const shouldIncludeWeak = weakPairs.length > 0 && Math.random() < 0.7 && activeFilter === null;
            let weakToInclude = [];

            if (shouldIncludeWeak) {
                const shuffledWeak = [...weakPairs].sort(() => Math.random() - 0.5);
                weakToInclude = shuffledWeak.slice(0, Math.min(numPairs, 1)); // Include at least one

                weakToInclude.forEach(pair => {
                    questionWords.push(pair.word1, pair.word2);
                    correctPairs.push({
                        words: [pair.word1, pair.word2],
                        meaning: pair.word1Info?.meaning || pair.word2Info?.meaning || 'Weak Word Review'
                    });
                });
            }

            const activePool = activeFilter !== null
                ? SYNONYM_GROUPS.filter(g => g.clusterId === activeFilter)
                : SYNONYM_GROUPS;

            const pool = activePool.length >= 1 ? activePool : SYNONYM_GROUPS;
            const selectedGroups = [];
            const usedGroups = new Set();
            const targetCount = Math.min(numPairs - correctPairs.length, pool.length);

            while (selectedGroups.length < targetCount) {
                const randomIndex = Math.floor(Math.random() * pool.length);
                if (!usedGroups.has(randomIndex)) {
                    const group = pool[randomIndex];
                    // Avoid picking a group that contains words already in questionWords (from weak pairs)
                    const hasConflict = group.words.some(w => questionWords.includes(w));
                    if (!hasConflict) {
                        selectedGroups.push(group);
                        usedGroups.add(randomIndex);
                    } else {
                        // If we searched too many times and can't find a conflict-free group, just break
                        if (usedGroups.size > pool.length / 2) break;
                        usedGroups.add(randomIndex); // skip this one
                    }
                }
            }

            selectedGroups.forEach(group => {
                const shuffled = [...group.words].sort(() => Math.random() - 0.5);
                const pair = shuffled.slice(0, 2);
                questionWords.push(...pair);
                correctPairs.push({
                    words: pair,
                    meaning: group.meaning
                });
            });
        }

        const neededDistractors = 6 - questionWords.length;
        const shuffledDistractors = [...DISTRACTOR_WORDS].sort(() => Math.random() - 0.5);

        for (let i = 0; i < neededDistractors; i++) {
            let distractor = shuffledDistractors[i];
            let attempts = 0;
            // Ensure distractors don't overlap with question words
            while (questionWords.includes(distractor) && attempts < 50) {
                distractor = DISTRACTOR_WORDS[Math.floor(Math.random() * DISTRACTOR_WORDS.length)];
                attempts++;
            }
            if (!questionWords.includes(distractor)) {
                questionWords.push(distractor);
            }
        }

        const shuffledWords = questionWords.sort(() => Math.random() - 0.5);

        setCurrentQuestion({
            words: shuffledWords,
            correctPairs: correctPairs,
            numPairs: numPairs,
            isLockdown: isLockdown
        });
    };

    const toggleWord = (word) => {
        if (showFeedback) return;

        const index = selectedWords.indexOf(word);

        if (index !== -1) {
            const newSelected = selectedWords.filter(w => w !== word);
            setSelectedWords(newSelected);
        } else {
            if (selectedWords.length < 6) {
                setSelectedWords([...selectedWords, word]);
            }
        }
    };

    const checkAnswer = async () => {
        if (selectedWords.length === 0) return;

        setShowFeedback(true);

        const userPairs = [];
        for (let i = 0; i < selectedWords.length; i += 2) {
            if (i + 1 < selectedWords.length) {
                userPairs.push([selectedWords[i], selectedWords[i + 1]]);
            }
        }

        const results = userPairs.map((userPair, index) => {
            const [word1, word2] = userPair;

            const correctPair = currentQuestion.correctPairs.find(pair =>
                (pair.words.includes(word1) && pair.words.includes(word2))
            );

            const isCorrect = !!correctPair;

            // If incorrect, add to weak pairs
            if (!isCorrect) {
                addWeakPair(word1, word2, `Incorrect pairing - these words don't share the same meaning`);
            } else {
                // If correct, check if this pair was previously weak and increment correct count
                removeWeakPairIfConsistent(word1, word2);
            }

            return {
                pairNumber: index + 1,
                words: userPair,
                isCorrect: isCorrect,
                meaning: correctPair ? correctPair.meaning : null
            };
        });

        // Check for missed pairs
        currentQuestion.correctPairs.forEach(correctPair => {
            const wasSelected = results.some(result =>
                result.isCorrect &&
                result.words.includes(correctPair.words[0]) &&
                result.words.includes(correctPair.words[1])
            );

            if (!wasSelected) {
                addWeakPair(
                    correctPair.words[0],
                    correctPair.words[1],
                    `Missed pair - Both mean: ${correctPair.meaning}`
                );
            }
        });

        setPairResults(results);

        const allCorrect = results.every(r => r.isCorrect) && results.length === currentQuestion.numPairs;
        setScore(prev => ({
            correct: prev.correct + (allCorrect ? 1 : 0),
            total: prev.total + 1
        }));
    };

    const addWeakPair = async (word1, word2, reason) => {
        if (!user?.id) return;

        const word1Info = getWordInfo(word1);
        const word2Info = getWordInfo(word2);

        await saveWeakPair(user.id, word1, word2, word1Info, word2Info, reason);

        // Refresh weak pairs from Supabase
        const pairs = await fetchWeakPairs(user.id);
        setWeakPairs(pairs);
    };

    const removeWeakPairIfConsistent = async (word1, word2) => {
        if (!user?.id) return;

        // In lockdown or normal mode, we now require 3 streaks to graduate
        await updateCorrectStreak(user.id, word1, word2);

        // Refresh weak pairs from Supabase
        const pairs = await fetchWeakPairs(user.id);
        setWeakPairs(pairs);
    };

    const clearWeakPairs = async () => {
        if (window.confirm('Are you sure you want to clear all weak pairs?')) {
            if (user?.id) {
                await clearAllWeakPairs(user.id);
                setWeakPairs([]);
            }
        }
    };

    const getWordPairNumber = (word) => {
        const index = selectedWords.indexOf(word);
        if (index === -1) return null;
        return Math.floor(index / 2) + 1;
    };

    const getPairColor = (pairNumber) => {
        const colors = [
            { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' },
            { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800' },
            { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-800' }
        ];
        return colors[(pairNumber - 1) % 3];
    };

    const handleSearch = () => {
        const q = (searchQuery || '').trim();
        if (!q) return;

        // Check if word exists in the 1100-word list (exact match only)
        const info = getWordInfo(q);
        setSearchResult({ word: q, info });
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResult(null);
    };

    if (!currentQuestion && currentView === 'practice') {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const isLockdown = weakPairs.length >= 30;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Lockdown Banner */}
                {isLockdown && currentView === 'practice' && (
                    <div className="bg-red-600 text-white p-3 rounded-t-lg text-center animate-pulse flex items-center justify-center gap-2 font-bold text-sm">
                        <AlertCircle size={18} />
                        WEAK-PAIR LOCKDOWN: FOCUS ON MASTERING THESE 30 PAIRS
                    </div>
                )}

                {/* Group Filter Banner */}
                {groupFilter && currentView === 'practice' && (
                    <div className={`bg-indigo-600 text-white p-3 flex items-center justify-between px-6 font-bold text-sm ${isLockdown ? 'border-t border-indigo-400' : 'rounded-t-lg'}`}>
                        <div className="flex items-center gap-2">
                            <PlayCircle size={18} />
                            PRACTICING: {CLUSTER_TREE.find(c => c.id === groupFilter)?.name || `Group ${groupFilter}`}
                        </div>
                        <button
                            onClick={() => {
                                setGroupFilter(null);
                                generateQuestion(null);
                            }}
                            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                            <X size={14} /> Clear Filter
                        </button>
                    </div>
                )}

                {/* Main Header */}
                <div className={`bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-6 ${isLockdown && currentView === 'practice' ? 'rounded-t-none border-t-0' : ''}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-indigo-600 shrink-0" size={32} />
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">GRE Vocab Master</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 md:gap-6 bg-slate-50 p-3 rounded-xl md:bg-transparent md:p-0">
                            <div className="text-left md:text-right">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Score</div>
                                <div className="text-xl md:text-2xl font-black text-indigo-600 leading-none">{score.correct}/{score.total}</div>
                            </div>
                            <div className="text-left md:text-right border-l md:border-l-0 pl-3 md:pl-0 border-gray-200">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Accuracy</div>
                                <div className="text-xl md:text-2xl font-black text-green-600 leading-none">{accuracy}%</div>
                            </div>
                            <div className="text-left md:text-right border-l md:border-l-0 pl-3 md:pl-0 border-gray-200">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Weak</div>
                                <div className="text-xl md:text-2xl font-black text-red-600 leading-none">{weakPairs.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* View Selector & Search */}
                    <div className="space-y-4">
                        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 hide-scrollbar md:pb-0 md:mx-0 md:px-0">
                            <button
                                onClick={() => setCurrentView('practice')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm whitespace-nowrap transition-all ${currentView === 'practice'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Trophy size={16} />
                                Practice Quiz
                            </button>
                            <button
                                onClick={() => setCurrentView('tree')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm whitespace-nowrap transition-all ${currentView === 'tree'
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200 ring-2 ring-purple-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Eye size={16} />
                                Visual Tree
                            </button>
                            <button
                                onClick={() => setCurrentView('weak')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm whitespace-nowrap transition-all ${currentView === 'weak'
                                    ? 'bg-red-600 text-white shadow-md shadow-red-200 ring-2 ring-red-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <TrendingDown size={16} />
                                Weak Pairs
                            </button>
                            <button
                                onClick={() => setCurrentView('recall')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs md:text-sm whitespace-nowrap transition-all ${currentView === 'recall'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Edit3 size={16} />
                                Recall Quiz
                            </button>
                        </div>

                        {/* Quick Word Search */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 border-t border-gray-50 pt-4">
                            <div className="relative w-full">
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search 1100 words..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={handleSearch} className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">Search</button>
                                <button onClick={clearSearch} className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-500 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">Clear</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weak Words Strip — shown on all views when there are weak pairs */}
                <WeakStrip
                    weakPairs={weakPairs}
                    onResult={async (word, isCorrect) => {
                        // Find matching pair and update streak
                        if (user?.id && isCorrect) {
                            const matchingPair = weakPairs.find(p =>
                                p.word1.toLowerCase() === word.toLowerCase() ||
                                p.word2.toLowerCase() === word.toLowerCase()
                            );
                            if (matchingPair) {
                                await removeWeakPairIfConsistent(matchingPair.word1, matchingPair.word2);
                            }
                        }
                    }}
                />

                {/* Content Area */}
                {/* Search Result Display */}
                {searchResult && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold mb-3">Search Result</h2>
                        <WeakWordDetail word={searchResult.word} wordInfo={searchResult.info} />
                    </div>
                )}
                {currentView === 'tree' && <ClusterTreeView
                    searchQuery={searchQuery}
                    weakPairs={weakPairs}
                    weakWords={(() => {
                        const s = new Set();
                        weakPairs.forEach(p => { s.add(p.word1.toLowerCase()); s.add(p.word2.toLowerCase()); });
                        return s;
                    })()}
                    onStartQuiz={(groupId) => {
                        setGroupFilter(groupId);
                        setCurrentView('practice');
                        generateQuestion(groupId);
                    }}
                />}
                {currentView === 'recall' && <RecallQuiz />}

                {currentView === 'weak' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <TrendingDown className="text-red-600 shrink-0" size={28} />
                                Words to Remember
                            </h2>
                            {weakPairs.length > 0 && (
                                <button
                                    onClick={clearWeakPairs}
                                    className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {weakPairs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-lg">No weak pairs yet! Keep practicing.</p>
                                <p className="text-sm mt-2">Pairs you get wrong will appear here for review.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {weakPairs.map((pair, index) => {
                                    const hasSameMeaning = pair.word1Info?.meaning && pair.word1Info?.meaning === pair.word2Info?.meaning;
                                    const combinedSynonyms = Array.from(new Set([
                                        ...(pair.word1Info?.synonyms || []),
                                        ...(pair.word2Info?.synonyms || [])
                                    ])).filter(s => s.toLowerCase() !== pair.word1.toLowerCase() && s.toLowerCase() !== pair.word2.toLowerCase());

                                    return (
                                        <div key={index} className="bg-white border-2 border-red-200 rounded-lg p-5 shadow-sm">
                                            {/* Header with pair and stats */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-red-100">
                                                <div className="flex items-center flex-wrap gap-2">
                                                    <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg font-bold text-base md:text-lg">
                                                        {pair.word1}
                                                    </span>
                                                    <span className="text-red-600 font-bold text-xl">+</span>
                                                    <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg font-bold text-base md:text-lg">
                                                        {pair.word2}
                                                    </span>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <div className="text-gray-600 font-semibold">Attempts: <span className="text-red-600">{pair.attempts}</span></div>
                                                    <div className="text-gray-600 font-semibold">
                                                        Mastery: <span className={pair.correctStreak >= 2 ? 'text-green-600' : 'text-orange-600'}>
                                                            {pair.correctStreak}/3
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Error reason or Simplified Meaning */}
                                            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded mb-4">
                                                <div className="text-sm text-red-800 font-semibold flex items-start gap-2">
                                                    <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                                                    <span>{pair.reason}</span>
                                                </div>
                                            </div>

                                            {/* Detailed information or Simplified Related Words */}
                                            {hasSameMeaning ? (
                                                <div className="mt-4">
                                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Related Words</div>
                                                    <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                                                        {combinedSynonyms.length > 0 ? combinedSynonyms.join(', ') : '—'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-700 mb-2">Word 1 Details:</div>
                                                        <WeakWordDetail word={pair.word1} wordInfo={pair.word1Info} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-700 mb-2">Word 2 Details:</div>
                                                        <WeakWordDetail word={pair.word2} wordInfo={pair.word2Info} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Last seen */}
                                            <div className="text-xs text-gray-500 mt-4 text-right italic">
                                                Last seen: {new Date(pair.lastSeen).toLocaleDateString()} at {new Date(pair.lastSeen).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {currentView === 'practice' && currentQuestion && (
                    <>
                        {/* Instructions */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                                <p className="text-sm text-gray-700">
                                    <strong>Instructions:</strong> Select words in pairs. First two = Pair 1, next two = Pair 2, etc.
                                </p>
                            </div>

                            {/* Selection Status */}
                            {!showFeedback && selectedWords.length > 0 && (
                                <div className="mt-4 bg-white border-2 border-indigo-200 rounded-lg p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3].map(pairNum => {
                                            const startIndex = (pairNum - 1) * 2;
                                            const word1 = selectedWords[startIndex];
                                            const word2 = selectedWords[startIndex + 1];
                                            const colors = getPairColor(pairNum);

                                            if (!word1 && !word2) return null;

                                            return (
                                                <div key={pairNum} className={`${colors.bg} ${colors.border} border-2 rounded-lg p-3`}>
                                                    <div className={`text-xs font-bold ${colors.text} mb-1`}>Pair {pairNum}</div>
                                                    <div className="flex gap-2">
                                                        {word1 && <span className={`${colors.text} font-semibold`}>{word1}</span>}
                                                        {word1 && word2 && <span className={colors.text}>+</span>}
                                                        {word2 && <span className={`${colors.text} font-semibold`}>{word2}</span>}
                                                        {word1 && !word2 && <span className={`${colors.text} opacity-50`}>?</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Word Selection */}
                        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 mb-6">
                            <div className="grid grid-cols-1 gap-3 md:gap-4">
                                {currentQuestion.words.map((word, index) => {
                                    const isSelected = selectedWords.includes(word);
                                    const pairNumber = getWordPairNumber(word);

                                    let bgColor = 'bg-gray-50 hover:bg-gray-100';
                                    let borderColor = 'border-gray-300';
                                    let textColor = 'text-gray-800';

                                    if (isSelected && !showFeedback) {
                                        const colors = getPairColor(pairNumber);
                                        bgColor = colors.bg;
                                        borderColor = colors.border;
                                        textColor = colors.text;
                                    }

                                    let animClass = '';
                                    if (showFeedback && isSelected) {
                                        const pairIndex = Math.floor(selectedWords.indexOf(word) / 2);
                                        const result = pairResults[pairIndex];

                                        if (result && result.isCorrect) {
                                            bgColor = 'bg-green-100';
                                            borderColor = 'border-green-500';
                                            textColor = 'text-green-800';
                                            animClass = 'animate-green-pulse';
                                        } else if (result) {
                                            bgColor = 'bg-red-100';
                                            borderColor = 'border-red-500';
                                            textColor = 'text-red-800';
                                            animClass = 'animate-shake animate-red-glow';
                                        }
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => toggleWord(word)}
                                            disabled={showFeedback}
                                            className={`${bgColor} ${textColor} border-2 ${borderColor} p-4 md:p-6 rounded-xl text-left font-bold text-base md:text-lg transition-all duration-200 ${!showFeedback ? 'cursor-pointer active:scale-95' : 'cursor-default transition-none'} ${animClass}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{word}</span>
                                                {isSelected && !showFeedback && (
                                                    <div className={`text-xs font-bold ${textColor}`}>P{pairNumber}</div>
                                                )}
                                                {showFeedback && isSelected && (
                                                    <>
                                                        {pairResults[Math.floor(selectedWords.indexOf(word) / 2)]?.isCorrect ? (
                                                            <CheckCircle className="text-green-600" size={24} />
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                <XCircle className="text-red-600" size={24} />
                                                                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">!</span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Feedback */}
                        {showFeedback && (
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Results</h3>

                                <div className="space-y-3 mb-6">
                                    <h4 className="font-semibold text-gray-700">Your Pairs:</h4>
                                    {pairResults.map((result, index) => (
                                        <div key={index}>
                                            <div className={`${result.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4 p-4 rounded`}>
                                                <div className="flex items-center gap-2">
                                                    {result.isCorrect ? <CheckCircle className="text-green-600" size={20} /> : <XCircle className="text-red-600" size={20} />}
                                                    <div className="flex-1">
                                                        <div className={`font-semibold ${result.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                                            Pair {result.pairNumber}: {result.words[0]} & {result.words[1]}
                                                        </div>
                                                        {result.isCorrect ? (
                                                            <div className="text-sm text-gray-700 mt-1">✓ Correct! Both mean: <em>{result.meaning}</em></div>
                                                        ) : (
                                                            <div className="text-sm text-gray-700 mt-1">✗ These words do not form a valid synonym pair.</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Show detailed breakdown for incorrect pairs */}
                                            {!result.isCorrect && (
                                                <div className="mt-3 ml-4 grid md:grid-cols-2 gap-4">
                                                    <WordDetailCard
                                                        word={result.words[0]}
                                                        wordInfo={getWordInfo(result.words[0])}
                                                    />
                                                    <WordDetailCard
                                                        word={result.words[1]}
                                                        wordInfo={getWordInfo(result.words[1])}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-700">Correct Pairs:</h4>
                                    {currentQuestion.correctPairs.map((pair, index) => (
                                        <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                            <div className="font-semibold text-blue-800">{pair.words[0]} & {pair.words[1]}</div>
                                            <div className="text-sm text-gray-700 mt-1">Both mean: <em>{pair.meaning}</em></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-center">
                            {!showFeedback ? (
                                <button
                                    onClick={checkAnswer}
                                    disabled={selectedWords.length === 0 || selectedWords.length % 2 !== 0}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center gap-2 transition-colors"
                                >
                                    <Trophy size={20} />
                                    Check Answer
                                </button>
                            ) : (
                                <button
                                    onClick={generateQuestion}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center gap-2 transition-colors"
                                >
                                    <RotateCcw size={20} />
                                    Next Question
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VocabStudyApp;
