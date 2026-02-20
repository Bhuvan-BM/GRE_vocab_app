import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, BookOpen, AlertCircle, ChevronDown, ChevronRight, Eye, Brain, TrendingDown } from 'lucide-react';

// Comprehensive cluster tree structure with ALL 47 clusters
const CLUSTER_TREE = [
    {
        id: 1,
        name: "Praise & Approval",
        subClusters: [
            { name: "Active Public Praise", words: ['acclaim', 'laud', 'extol', 'tout', 'lionize', 'canonize', 'commend'] },
            { name: "Quiet Admiration", words: ['venerate', 'esteem', 'cherish', 'revere'] },
            { name: "Deserving Praise", words: ['laudable', 'meritorious', 'estimable', 'felicitous'] },
            { name: "Generous Character", words: ['magnanimous', 'altruistic', 'benevolent', 'beneficent', 'munificent'] }
        ]
    },
    {
        id: 2,
        name: "Criticize & Scold",
        subClusters: [
            { name: "Mild Criticism", words: ['admonish', 'reproach', 'deprecate'] },
            { name: "Harsh Verbal Attack", words: ['berate', 'castigate', 'chastise', 'upbraid', 'lambaste', 'excoriate'] },
            { name: "Public Condemnation", words: ['censure', 'denounce', 'decry'] },
            { name: "Mock & Belittle", words: ['deride', 'scorn', 'disdain', 'disparage', 'denigrate', 'belittle'] },
            { name: "Defamation", words: ['malign', 'calumny', 'slander', 'defame'] },
            { name: "Contemptuous Manner", words: ['caustic', 'mordant', 'acerbic', 'scathing'] }
        ]
    },
    {
        id: 3,
        name: "Calm & Soothe",
        subClusters: [
            { name: "Active Calming", words: ['appease', 'placate', 'pacify', 'mollify'] },
            { name: "Reduce Intensity", words: ['assuage', 'alleviate', 'ameliorate', 'mitigate'] },
            { name: "Decrease Gradually", words: ['abate', 'subside', 'wane', 'ebb'] },
            { name: "State of Calmness", words: ['tranquil', 'serene', 'placid', 'quiescent'] }
        ]
    },
    {
        id: 4,
        name: "Arrogant & Haughty",
        subClusters: [
            { name: "Looking Down on Others", words: ['haughty', 'supercilious', 'condescending', 'patronize'] },
            { name: "Domineering", words: ['imperious', 'magisterial'] },
            { name: "Self-Important", words: ['pompous', 'pretentious', 'presumptuous'] },
            { name: "Showy Display", words: ['ostentatious', 'bombastic', 'grandiose'] }
        ]
    },
    {
        id: 5,
        name: "Stubborn & Inflexible",
        subClusters: [
            { name: "Refusing to Change", words: ['obstinate', 'obdurate', 'intransigent', 'recalcitrant'] },
            { name: "Persistent (Positive)", words: ['pertinacious', 'dogged', 'tenacious'] },
            { name: "Firm & Unwavering", words: ['resolute', 'steadfast', 'stalwart'] },
            { name: "Cannot Be Changed", words: ['immutable', 'inexorable', 'inflexible'] }
        ]
    },
    {
        id: 6,
        name: "Deceptive & Dishonest",
        subClusters: [
            { name: "Outward Deception", words: ['duplicitous', 'disingenuous', 'dissemble'] },
            { name: "Pretending/Faking", words: ['feign', 'sham', 'phony'] },
            { name: "Lying", words: ['mendacity', 'prevaricate', 'equivocate', 'fabricate'] },
            { name: "False Things", words: ['bogus', 'spurious', 'specious', 'fallacious'] },
            { name: "Trickery", words: ['chicanery', 'skullduggery', 'malfeasance'] }
        ]
    },
    {
        id: 7,
        name: "Brief & Temporary",
        subClusters: [
            { name: "Short-Lived", words: ['ephemeral', 'evanescent', 'transient', 'fleeting', 'momentary'] },
            { name: "Lacking Thoroughness", words: ['cursory', 'perfunctory', 'superficial'] },
            { name: "Brief Expression", words: ['terse', 'laconic', 'pithy', 'succinct', 'concise'] }
        ]
    },
    {
        id: 8,
        name: "Eager & Enthusiastic",
        subClusters: [
            { name: "Quick Eagerness", words: ['alacrity'] },
            { name: "Passionate Devotion", words: ['ardent', 'fervent', 'fervid', 'zealous', 'avid'] },
            { name: "Hardworking", words: ['sedulous', 'diligent', 'industrious'] },
            { name: "Lively & Spirited", words: ['ebullient', 'exuberant', 'buoyant', 'vivacious'] }
        ]
    },
    {
        id: 9,
        name: "Obscure & Unclear",
        subClusters: [
            { name: "Understood by Few", words: ['abstruse', 'arcane', 'esoteric', 'recondite'] },
            { name: "Mysterious", words: ['enigmatic', 'cryptic', 'inscrutable'] },
            { name: "Not Clear", words: ['opaque', 'obscure', 'murky'] },
            { name: "Overly Complex", words: ['convoluted', 'labyrinthine', 'byzantine'] }
        ]
    },
    {
        id: 10,
        name: "Hostile & Aggressive",
        subClusters: [
            { name: "Fighting Spirit", words: ['belligerent', 'pugnacious', 'truculent', 'contentious'] },
            { name: "Harmful Intent", words: ['inimical', 'malevolent', 'malicious', 'spiteful'] },
            { name: "Bitter Hostility", words: ['antipathy', 'animosity', 'enmity'] },
            { name: "Bitter Expression", words: ['acrimonious', 'virulent', 'venomous'] }
        ]
    },
    {
        id: 11,
        name: "Talkative & Wordy",
        subClusters: [
            { name: "Talking Too Much", words: ['garrulous', 'loquacious', 'verbose', 'voluble'] },
            { name: "Using Too Many Words", words: ['prolix', 'diffuse', 'redundant'] }
        ]
    },
    {
        id: 12,
        name: "Lazy & Sluggish",
        subClusters: [
            { name: "Habitually Lazy", words: ['indolent', 'slothful', 'idle'] },
            { name: "Lacking Energy", words: ['lethargic', 'sluggish', 'languid'] },
            { name: "Sleepy", words: ['somnolent', 'soporific'] },
            { name: "Inactive State", words: ['torpid', 'dormant', 'stagnant'] }
        ]
    },
    {
        id: 13,
        name: "Small & Insignificant",
        subClusters: [
            { name: "Physically Small", words: ['diminutive', 'minute', 'minuscule'] },
            { name: "Insufficient Amount", words: ['scant', 'meager', 'sparse', 'paucity', 'dearth'] },
            { name: "Unimportant", words: ['negligible', 'trivial', 'trifling'] }
        ]
    },
    {
        id: 14,
        name: "Skillful & Clever",
        subClusters: [
            { name: "Skilled with Hands", words: ['adept', 'adroit', 'deft', 'dexterous'] },
            { name: "Mentally Sharp", words: ['astute', 'shrewd', 'canny', 'sagacious', 'perspicacious'] },
            { name: "Perceptive", words: ['discerning', 'perceptive', 'insightful'] },
            { name: "Wise Decision-Making", words: ['judicious', 'prudent', 'sensible'] }
        ]
    },
    {
        id: 15,
        name: "Support & Strengthen",
        subClusters: [
            { name: "Physical Support", words: ['bolster', 'buttress', 'fortify'] },
            { name: "Support with Evidence", words: ['corroborate', 'substantiate', 'validate'] },
            { name: "Public Support", words: ['advocate', 'champion', 'endorse'] },
            { name: "Encourage Growth", words: ['foster', 'nurture', 'cultivate'] }
        ]
    },
    {
        id: 16,
        name: "Abundant & Excessive",
        subClusters: [
            { name: "Large Quantities", words: ['abound', 'copious', 'profuse', 'plentiful', 'abundant'] },
            { name: "Rapid Increase", words: ['proliferate', 'burgeon', 'flourish'] },
            { name: "More Than Needed", words: ['superfluous', 'redundant', 'excessive'] },
            { name: "Wastefully Excessive", words: ['extravagant', 'lavish', 'prodigal', 'profligate'] }
        ]
    },
    {
        id: 17,
        name: "Angry & Irritable",
        subClusters: [
            { name: "Easily Angered", words: ['irascible', 'choleric', 'cantankerous'] },
            { name: "Complaining", words: ['petulant', 'peevish', 'querulous'] },
            { name: "Unpleasant Manner", words: ['churlish', 'surly', 'morose'] }
        ]
    },
    {
        id: 18,
        name: "Careful & Cautious",
        subClusters: [
            { name: "Alert Caution", words: ['circumspect', 'cautious', 'wary', 'chary'] },
            { name: "Wise Decision-Making", words: ['prudent', 'judicious', 'discreet'] },
            { name: "Extremely Careful", words: ['meticulous', 'fastidious', 'punctilious', 'scrupulous', 'painstaking'] }
        ]
    },
    {
        id: 19,
        name: "Reject & Abandon",
        subClusters: [
            { name: "Formally Reject", words: ['abjure', 'renounce', 'repudiate', 'recant', 'retract'] },
            { name: "Avoid Doing", words: ['eschew', 'abstain', 'forbear', 'refrain'] },
            { name: "Give Up", words: ['relinquish', 'forsake', 'abandon', 'jettison'] },
            { name: "Refuse", words: ['spurn', 'rebuff', 'gainsay'] }
        ]
    },
    {
        id: 20,
        name: "Flexible & Adaptable",
        subClusters: [
            { name: "Physically Bendable", words: ['malleable', 'pliable', 'pliant', 'supple'] },
            { name: "Willing to Cooperate", words: ['tractable', 'amenable', 'compliant', 'docile'] },
            { name: "Adaptable", words: ['adaptable', 'versatile', 'flexible'] }
        ]
    },
    {
        id: 21,
        name: "Old & Outdated",
        subClusters: [
            { name: "Old-Fashioned", words: ['archaic', 'anachronistic', 'antiquated', 'obsolete'] },
            { name: "No Longer Useful", words: ['outmoded', 'vestigial'] }
        ]
    },
    {
        id: 22,
        name: "Secret & Hidden",
        subClusters: [
            { name: "Done in Secret", words: ['clandestine', 'covert', 'surreptitious', 'furtive', 'stealthy'] },
            { name: "Hide/Conceal", words: ['cloak', 'veil', 'conceal', 'occlude'] }
        ]
    },
    {
        id: 23,
        name: "Naive & Innocent",
        subClusters: [
            { name: "Lacking Experience", words: ['naive', 'ingenuous', 'artless', 'guileless'] },
            { name: "Easily Deceived", words: ['credulous', 'gullible'] },
            { name: "Straightforward", words: ['candid', 'frank'] }
        ]
    },
    {
        id: 24,
        name: "Greedy & Selfish",
        subClusters: [
            { name: "Greedy for Wealth", words: ['avaricious', 'rapacious', 'covetous', 'acquisitive'] },
            { name: "Motivated by Money", words: ['mercenary', 'venal'] },
            { name: "Stingy", words: ['miserly', 'parsimonious', 'penurious'] }
        ]
    },
    {
        id: 25,
        name: "Bold & Fearless",
        subClusters: [
            { name: "Boldly Brave", words: ['audacious', 'brazen', 'intrepid'] },
            { name: "Undaunted Courage", words: ['dauntless', 'undaunted'] },
            { name: "Heroic Courage", words: ['valiant', 'valorous', 'gallant'] }
        ]
    },
    {
        id: 26,
        name: "Hesitant & Uncertain",
        subClusters: [
            { name: "Wavering", words: ['vacillate', 'waver', 'equivocate'] },
            { name: "Mixed Feelings", words: ['ambivalent', 'irresolute'] },
            { name: "Doubtful", words: ['dubious', 'incredulous', 'skeptical'] }
        ]
    },
    {
        id: 27,
        name: "Happy & Joyful",
        subClusters: [
            { name: "Extremely Happy", words: ['elated', 'euphoric', 'jubilant', 'gleeful'] },
            { name: "Cheerfully Energetic", words: ['ebullient', 'exuberant', 'buoyant', 'vivacious'] },
            { name: "Pleasantly Happy", words: ['jocund', 'jovial', 'merry', 'cheerful'] }
        ]
    },
    {
        id: 28,
        name: "Sad & Gloomy",
        subClusters: [
            { name: "Mournful", words: ['lugubrious', 'doleful', 'mournful', 'plaintive'] },
            { name: "Gloomy", words: ['melancholy', 'somber', 'morose', 'sullen', 'glum'] },
            { name: "Dejected", words: ['dejected', 'despondent', 'crestfallen', 'forlorn'] }
        ]
    },
    {
        id: 29,
        name: "Rude & Ill-Mannered",
        subClusters: [
            { name: "Crude/Coarse", words: ['boorish', 'churlish', 'uncouth', 'crass'] },
            { name: "Disrespectfully Bold", words: ['impertinent', 'impudent', 'insolent', 'presumptuous'] },
            { name: "Improper", words: ['unseemly', 'indecorous', 'gauche'] }
        ]
    },
    {
        id: 30,
        name: "Harsh & Severe",
        subClusters: [
            { name: "Strict/Demanding", words: ['austere', 'stern', 'stringent', 'rigorous', 'draconian'] },
            { name: "Merciless", words: ['ruthless', 'merciless', 'relentless', 'unforgiving'] }
        ]
    },
    {
        id: 31,
        name: "Weak & Declining",
        subClusters: [
            { name: "Physically Weak", words: ['feeble', 'frail', 'fragile'] },
            { name: "Drain Energy", words: ['enervate', 'debilitate', 'attenuate'] },
            { name: "Decrease", words: ['diminish', 'wane', 'decline', 'languish'] }
        ]
    },
    {
        id: 32,
        name: "Mixed & Diverse",
        subClusters: [
            { name: "Diverse Elements", words: ['heterogeneous', 'disparate', 'diverse'] },
            { name: "Many-Faceted", words: ['multifaceted', 'eclectic'] },
            { name: "Mixture", words: ['hodgepodge', 'medley', 'amalgamation'] }
        ]
    },
    {
        id: 33,
        name: "Uniform & Similar",
        subClusters: [
            { name: "Same Throughout", words: ['homogeneous', 'uniform', 'consistent'] },
            { name: "Comparable", words: ['analogous', 'similar', 'comparable'] },
            { name: "Equal/Equivalent", words: ['equivalent', 'commensurate', 'tantamount'] }
        ]
    },
    {
        id: 34,
        name: "Boring & Monotonous",
        subClusters: [
            { name: "Lacking Originality", words: ['banal', 'hackneyed', 'trite', 'clichéd'] },
            { name: "Ordinary", words: ['mundane', 'humdrum', 'prosaic', 'pedestrian'] },
            { name: "Lacking Flavor", words: ['vapid', 'insipid', 'bland'] },
            { name: "Repetitively Dull", words: ['tedious', 'monotonous', 'dreary'] }
        ]
    },
    {
        id: 35,
        name: "Dangerous & Harmful",
        subClusters: [
            { name: "Harmful to Health", words: ['deleterious', 'detrimental', 'pernicious', 'noxious'] },
            { name: "Aggressively Harmful", words: ['virulent', 'malignant', 'baneful'] },
            { name: "Causing Destruction", words: ['destructive', 'ruinous', 'calamitous', 'catastrophic'] }
        ]
    },
    {
        id: 36,
        name: "Beneficial & Favorable",
        subClusters: [
            { name: "Promoting Health", words: ['salutary', 'salubrious', 'beneficial'] },
            { name: "Advantageous", words: ['advantageous', 'lucrative', 'fruitful'] },
            { name: "Favorable Signs", words: ['auspicious', 'propitious', 'providential', 'fortuitous'] }
        ]
    },
    {
        id: 37,
        name: "Modest & Humble",
        subClusters: [
            { name: "Not Boastful", words: ['modest', 'humble', 'unassuming', 'unpretentious'] },
            { name: "Reserved", words: ['reticent', 'retiring', 'reserved'] },
            { name: "Lacking Confidence", words: ['diffident', 'timorous', 'bashful'] }
        ]
    },
    {
        id: 38,
        name: "Loud & Noisy",
        subClusters: [
            { name: "Harsh Noise", words: ['clangor', 'cacophonous', 'raucous', 'strident'] },
            { name: "Energetic Noise", words: ['boisterous', 'tumultuous'] },
            { name: "Uncontrollably Loud", words: ['obstreperous', 'clamorous'] }
        ]
    },
    {
        id: 39,
        name: "Quiet & Reserved",
        subClusters: [
            { name: "Speaking Little", words: ['taciturn', 'reticent', 'laconic'] },
            { name: "Brief Expression", words: ['terse', 'succinct', 'concise', 'pithy'] }
        ]
    },
    {
        id: 40,
        name: "Impulsive & Rash",
        subClusters: [
            { name: "Acting Without Thought", words: ['impetuous', 'impulsive', 'rash', 'reckless'] },
            { name: "Sudden Action", words: ['precipitate', 'precipitous', 'hasty'] },
            { name: "Unpredictable", words: ['volatile', 'erratic', 'capricious', 'whimsical'] }
        ]
    },
    {
        id: 41,
        name: "Clear & Obvious",
        subClusters: [
            { name: "Transparently Clear", words: ['pellucid', 'lucid', 'limpid', 'transparent'] },
            { name: "Clearly Visible", words: ['obvious', 'evident', 'manifest', 'conspicuous'] },
            { name: "Tangible", words: ['palpable', 'tangible'] },
            { name: "No Room for Doubt", words: ['patent', 'overt', 'explicit', 'unambiguous'] }
        ]
    },
    {
        id: 42,
        name: "Rural & Parochial",
        subClusters: [
            { name: "Pleasant Rural", words: ['bucolic', 'pastoral', 'rustic'] },
            { name: "Narrow-Minded", words: ['provincial', 'parochial', 'insular', 'myopic'] }
        ]
    },
    {
        id: 43,
        name: "Sophisticated & Refined",
        subClusters: [
            { name: "Worldly", words: ['sophisticated', 'urbane', 'cosmopolitan', 'worldly'] },
            { name: "Refined Taste", words: ['cultured', 'refined', 'polished', 'elegant'] },
            { name: "Charming", words: ['suave', 'debonair'] }
        ]
    },
    {
        id: 44,
        name: "Beginner & New",
        subClusters: [
            { name: "Beginners", words: ['neophyte', 'novice', 'tyro', 'fledgling'] },
            { name: "Just Beginning", words: ['nascent', 'embryonic', 'incipient', 'inchoate'] }
        ]
    },
    {
        id: 45,
        name: "Wandering & Roaming",
        subClusters: [
            { name: "Traveling", words: ['itinerant', 'peripatetic', 'nomadic'] },
            { name: "Moving About", words: ['roving', 'rambling', 'meandering'] }
        ]
    },
    {
        id: 46,
        name: "Sharp & Biting",
        subClusters: [
            { name: "Sharply Critical", words: ['mordant', 'caustic', 'sardonic', 'acerbic', 'scathing'] },
            { name: "Cutting Clarity", words: ['trenchant', 'incisive', 'penetrating'] },
            { name: "Angry/Bitter", words: ['acrimonious', 'vitriolic', 'venomous'] }
        ]
    },
    {
        id: 47,
        name: "Logic & Reasoning",
        subClusters: [
            { name: "Undeniably True", words: ['axiomatic', 'incontrovertible', 'indisputable'] },
            { name: "Based on Evidence", words: ['empirical', 'substantiated', 'corroborated'] },
            { name: "Logical/Valid", words: ['rational', 'sound', 'cogent', 'tenable'] },
            { name: "False Logic", words: ['fallacious', 'specious', 'spurious', 'bogus'] }
        ]
    }
];

// Synonym groups for the practice quiz
const SYNONYM_GROUPS = CLUSTER_TREE.flatMap(cluster =>
    cluster.subClusters.map(sub => ({
        words: sub.words,
        meaning: sub.name
    }))
).filter(group => group.words.length >= 2);

// Distractor words
const DISTRACTOR_WORDS = [
    'belie', 'capricious', 'cerebral', 'congenial', 'conspicuous', 'daunting', 'deify', 'didactic',
    'feasible', 'flout', 'homogeneous', 'humdrum', 'insipid', 'misnomer', 'negligent', 'quixotic',
    'spendthrift', 'proclivity', 'puerile', 'construe', 'contrite', 'derivative', 'desiccate',
    'incredulous', 'polarize', 'aberrant', 'abide', 'bravado', 'callow', 'capitulate', 'deportment',
    'nominal', 'odious', 'plucky', 'precocious', 'remuneration', 'slovenly', 'soliloquy', 'temerity', 'verve'
];

// Build comprehensive word dictionary with meanings, synonyms, and cluster info
const buildWordDictionary = () => {
    const dictionary = {};

    CLUSTER_TREE.forEach(cluster => {
        cluster.subClusters.forEach(subCluster => {
            subCluster.words.forEach(word => {
                if (!dictionary[word]) {
                    dictionary[word] = {
                        meaning: subCluster.name,
                        synonyms: subCluster.words.filter(w => w !== word),
                        cluster: `Cluster ${cluster.id}: ${cluster.name}`,
                        subCluster: subCluster.name
                    };
                }
            });
        });
    });

    return dictionary;
};

const WORD_DICTIONARY = buildWordDictionary();

// Component for displaying detailed word information
// Supports a compact mode for simplified displays (used in Weak Pairs)
const WordDetailCard = ({ word, wordInfo, compact = false }) => {
    if (!wordInfo || !wordInfo.meaning) return null;

    if (compact) {
        return (
            <div className="bg-white p-3 rounded border border-gray-200 mt-2">
                <div className="text-lg font-bold text-gray-800 mb-1">{word}</div>

                <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Meaning:</div>
                <div className="text-sm text-gray-800 italic mb-2">"{wordInfo.meaning}"</div>

                {wordInfo.synonyms && wordInfo.synonyms.length > 0 && (
                    <>
                        <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Correct Pairs (Synonyms):</div>
                        <div className="text-sm text-gray-700">{wordInfo.synonyms.join(', ')}</div>
                    </>
                )}
            </div>
        );
    }

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
                <div className="text-sm text-gray-800 font-medium italic">"{wordInfo.meaning}"</div>
            </div>

            {wordInfo.synonyms && wordInfo.synonyms.length > 0 && (
                <div>
                    <div className="text-xs font-semibold text-gray-600 uppercase mb-2">Correct Pairs (Synonyms):</div>
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

// Component for Visual Cluster Tree
const ClusterTreeView = () => {
    const [expandedClusters, setExpandedClusters] = useState(new Set([1, 2, 3])); // First 3 expanded by default

    const toggleCluster = (clusterId) => {
        const newExpanded = new Set(expandedClusters);
        if (newExpanded.has(clusterId)) {
            newExpanded.delete(clusterId);
        } else {
            newExpanded.add(clusterId);
        }
        setExpandedClusters(newExpanded);
    };

    const expandAll = () => {
        setExpandedClusters(new Set(CLUSTER_TREE.map(c => c.id)));
    };

    const collapseAll = () => {
        setExpandedClusters(new Set());
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Brain className="text-purple-600" size={28} />
                    Visual Cluster Tree - All 47 Clusters
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={expandAll}
                        className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded"
                    >
                        Expand All
                    </button>
                    <button
                        onClick={collapseAll}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
                    >
                        Collapse All
                    </button>
                </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {CLUSTER_TREE.map((cluster) => {
                    const isExpanded = expandedClusters.has(cluster.id);
                    return (
                        <div key={cluster.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Cluster Header */}
                            <button
                                onClick={() => toggleCluster(cluster.id)}
                                className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 p-4 flex items-center justify-between transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    <span className="font-bold text-gray-800">
                                        Cluster {cluster.id}: {cluster.name}
                                    </span>
                                    <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                                        {cluster.subClusters.length} sub-groups
                                    </span>
                                </div>
                            </button>

                            {/* Sub-clusters */}
                            {isExpanded && (
                                <div className="p-4 bg-gray-50 space-y-3">
                                    {cluster.subClusters.map((subCluster, idx) => (
                                        <div key={idx} className="bg-white border-l-4 border-indigo-400 rounded p-3">
                                            <div className="font-semibold text-indigo-700 mb-2 text-sm">
                                                📂 {subCluster.name}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {subCluster.words.map((word, wordIdx) => (
                                                    <span
                                                        key={wordIdx}
                                                        className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200"
                                                    >
                                                        {word}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600 italic">
                                                {subCluster.words.length} synonymous words
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Main App Component
const VocabStudyApp = () => {
    const [currentView, setCurrentView] = useState('practice'); // 'practice', 'tree', 'weak'
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedWords, setSelectedWords] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [pairResults, setPairResults] = useState([]);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [weakPairs, setWeakPairs] = useState([]);

    // Load weak pairs from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('gre_weak_pairs');
        if (saved) {
            setWeakPairs(JSON.parse(saved));
        }
    }, []);

    // Save weak pairs to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('gre_weak_pairs', JSON.stringify(weakPairs));
    }, [weakPairs]);

    useEffect(() => {
        if (currentView === 'practice') {
            generateQuestion();
        }
    }, [currentView]);

    const generateQuestion = () => {
        setSelectedWords([]);
        setShowFeedback(false);
        setPairResults([]);

        const numPairs = Math.floor(Math.random() * 3) + 1;
        const selectedGroups = [];
        const usedGroups = new Set();

        while (selectedGroups.length < numPairs) {
            const randomIndex = Math.floor(Math.random() * SYNONYM_GROUPS.length);
            if (!usedGroups.has(randomIndex)) {
                const group = SYNONYM_GROUPS[randomIndex];
                if (group.words.length >= 2) {
                    selectedGroups.push(group);
                    usedGroups.add(randomIndex);
                }
            }
        }

        const questionWords = [];
        const correctPairs = [];

        selectedGroups.forEach(group => {
            const shuffled = [...group.words].sort(() => Math.random() - 0.5);
            const pair = shuffled.slice(0, 2);
            questionWords.push(...pair);
            correctPairs.push({
                words: pair,
                meaning: group.meaning
            });
        });

        const neededDistractors = 6 - questionWords.length;
        const shuffledDistractors = [...DISTRACTOR_WORDS].sort(() => Math.random() - 0.5);

        for (let i = 0; i < neededDistractors; i++) {
            let distractor = shuffledDistractors[i];
            let attempts = 0;
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
            numPairs: numPairs
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

    const checkAnswer = () => {
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

    const addWeakPair = (word1, word2, reason) => {
        const pairKey = [word1, word2].sort().join('|');

        // Get detailed info for both words
        const word1Info = WORD_DICTIONARY[word1] || {
            meaning: 'Unknown',
            synonyms: [],
            cluster: 'Unknown',
            subCluster: 'Unknown'
        };
        const word2Info = WORD_DICTIONARY[word2] || {
            meaning: 'Unknown',
            synonyms: [],
            cluster: 'Unknown',
            subCluster: 'Unknown'
        };

        setWeakPairs(prev => {
            const existing = prev.find(p => p.key === pairKey);
            if (existing) {
                return prev.map(p =>
                    p.key === pairKey
                        ? { ...p, attempts: p.attempts + 1, lastSeen: new Date().toISOString() }
                        : p
                );
            } else {
                return [...prev, {
                    key: pairKey,
                    word1,
                    word2,
                    word1Info,
                    word2Info,
                    reason,
                    attempts: 1,
                    correctStreak: 0,
                    lastSeen: new Date().toISOString()
                }];
            }
        });
    };

    const removeWeakPairIfConsistent = (word1, word2) => {
        const pairKey = [word1, word2].sort().join('|');

        setWeakPairs(prev => {
            const existing = prev.find(p => p.key === pairKey);
            if (existing) {
                const newStreak = existing.correctStreak + 1;
                // Remove after 3 consecutive correct answers
                if (newStreak >= 3) {
                    return prev.filter(p => p.key !== pairKey);
                } else {
                    return prev.map(p =>
                        p.key === pairKey
                            ? { ...p, correctStreak: newStreak, lastSeen: new Date().toISOString() }
                            : p
                    );
                }
            }
            return prev;
        });
    };

    const clearWeakPairs = () => {
        if (window.confirm('Are you sure you want to clear all weak pairs?')) {
            setWeakPairs([]);
            localStorage.removeItem('gre_weak_pairs');
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

    if (!currentQuestion && currentView === 'practice') {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Main Header */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-indigo-600" size={32} />
                            <h1 className="text-3xl font-bold text-gray-800">GRE Vocab Master</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-600">Score</div>
                                <div className="text-2xl font-bold text-indigo-600">{score.correct}/{score.total}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-600">Accuracy</div>
                                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-600">Weak Pairs</div>
                                <div className="text-2xl font-bold text-red-600">{weakPairs.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* View Selector */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentView('practice')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${currentView === 'practice'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <Trophy size={18} />
                            Practice Quiz
                        </button>
                        <button
                            onClick={() => setCurrentView('tree')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${currentView === 'tree'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <Eye size={18} />
                            Visual Tree
                        </button>
                        <button
                            onClick={() => setCurrentView('weak')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${currentView === 'weak'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <TrendingDown size={18} />
                            Weak Pairs ({weakPairs.length})
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {currentView === 'tree' && <ClusterTreeView />}

                {currentView === 'weak' && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <TrendingDown className="text-red-600" size={28} />
                                Words to Remember - Weak Pairs
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
                                {weakPairs.map((pair, index) => (
                                    <div key={index} className="bg-white border-2 border-red-200 rounded-lg p-5 shadow-sm">
                                        {/* Header with pair and stats */}
                                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-red-100">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-lg">
                                                    {pair.word1}
                                                </span>
                                                <span className="text-red-600 font-bold text-xl">+</span>
                                                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-lg">
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

                                        {/* Error reason */}
                                        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded mb-4">
                                            <div className="text-sm text-red-800 font-semibold flex items-start gap-2">
                                                <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                                                <span>{pair.reason}</span>
                                            </div>
                                        </div>

                                        {/* Detailed information for each word */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm font-bold text-gray-700 mb-2">Word 1 Details:</div>
                                                <WordDetailCard word={pair.word1} wordInfo={pair.word1Info} compact={true} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-700 mb-2">Word 2 Details:</div>
                                                <WordDetailCard word={pair.word2} wordInfo={pair.word2Info} compact={true} />
                                            </div>
                                        </div>

                                        {/* Last seen */}
                                        <div className="text-xs text-gray-500 mt-4 text-right">
                                            Last seen: {new Date(pair.lastSeen).toLocaleDateString()} at {new Date(pair.lastSeen).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {currentView === 'practice' && currentQuestion && (
                    <>
                        {/* Instructions */}
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Instructions:</strong> Select words in pairs. First two = Pair 1, next two = Pair 2, etc.
                                </p>
                                <p className="text-sm text-gray-700">
                                    This question has <strong>{currentQuestion.numPairs}</strong> correct pair(s).
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
                        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                            <div className="grid grid-cols-1 gap-4">
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

                                    if (showFeedback && isSelected) {
                                        const pairIndex = Math.floor(selectedWords.indexOf(word) / 2);
                                        const result = pairResults[pairIndex];

                                        if (result && result.isCorrect) {
                                            bgColor = 'bg-green-100';
                                            borderColor = 'border-green-500';
                                            textColor = 'text-green-800';
                                        } else if (result) {
                                            bgColor = 'bg-red-100';
                                            borderColor = 'border-red-500';
                                            textColor = 'text-red-800';
                                        }
                                    }

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => toggleWord(word)}
                                            disabled={showFeedback}
                                            className={`${bgColor} ${textColor} border-2 ${borderColor} p-6 rounded-lg text-left font-semibold text-lg transition-all duration-200 ${!showFeedback ? 'cursor-pointer' : 'cursor-default'}`}
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
                                                            <XCircle className="text-red-600" size={24} />
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
                                                        wordInfo={WORD_DICTIONARY[result.words[0]]}
                                                    />
                                                    <WordDetailCard
                                                        word={result.words[1]}
                                                        wordInfo={WORD_DICTIONARY[result.words[1]]}
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
