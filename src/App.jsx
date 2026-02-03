import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenerativeAI } from '@google/generative-ai';
const pdfJsLoader = (() => {
  let loader;
  return () => {
    if (!loader) {
      loader = import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs');
    }
    return loader;
  };
})();

const WIKI_BASE = 'https://jujutsu-kaisen.fandom.com/wiki';
const DEFAULT_WIKI_PAGE = `${WIKI_BASE}/Jujutsu_Kaisen_Wiki`;

const WIKI_SPOTLIGHTS = [
  {
    label: 'Main Wiki Portal',
    url: DEFAULT_WIKI_PAGE
  },
  {
    label: 'Gojo Satoru',
    url: `${WIKI_BASE}/Satoru_Gojo`
  },
  {
    label: 'Cursed Techniques',
    url: `${WIKI_BASE}/Cursed_Technique`
  },
  {
    label: 'Jujutsu Sorcerer',
    url: `${WIKI_BASE}/Jujutsu_Sorcerer`
  }
];

// ==========================================
// 📚 ARCHIVE 1: THE GRAND GRIMOIRE (Techniques)
// ==========================================
const TECHNIQUE_DB = [
  {
    id: 'limitless',
    name: 'Limitless (Mukagen)',
    user: 'Satoru Gojo',
    clanId: 'gojo',
    type: 'Inherited (Special)',
    grade: 'Special',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/d/d7/Satoru_Gojo_using_Limitless.png',
    desc: 'Manipulates the atomic concept of "Infinity" to bring Zeno\'s Paradox into reality. It creates an infinite series of fractions between the user and any approaching object.',
    abilities: [
      { name: 'Neutral', effect: 'Stops objects by dividing space infinitely.' },
      { name: 'Blue (Lapse)', effect: 'Creates "negative distance," forcing the universe to fill the void with violent magnetic attraction.' },
      { name: 'Red (Reversal)', effect: 'Flows Positive Energy into the technique to create a violent repulsive force.' },
      { name: 'Purple (Hollow)', effect: 'Merges Blue and Red to create imaginary mass that erases everything.' }
    ],
    domain: 'Unlimited Void',
    domainDesc: 'Floods the target with infinite information, causing catatonic paralysis and death by sensory overload.'
  },
  {
    id: 'shrine',
    name: 'Shrine (Mizushi)',
    user: 'Ryomen Sukuna',
    clanId: 'unknown',
    type: 'Innate (Special)',
    grade: 'Special',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/23/Malevolent_Shrine_Anime.png',
    desc: 'A technique centered on cutting and thermodynamics. The brain acts as a "Black Box" to store these formulas.',
    abilities: [
      { name: 'Dismantle', effect: 'The default slash used for inanimate objects. Travels at invisible speeds.' },
      { name: 'Cleave', effect: 'Adjusts intensity based on target toughness to cut them in one fell swoop.' },
      { name: 'World Slash', effect: 'Targets the "space" the world occupies rather than the person, cutting reality itself.' },
      { name: 'Divine Flame (Fuga)', effect: 'Opens the "Black Box" to create a thermobaric fire arrow.' }
    ],
    domain: 'Malevolent Shrine',
    domainDesc: 'An Open Barrier domain. It paints the innate domain onto reality, extending range to 200m.'
  },
  {
    id: 'ten-shadows',
    name: 'Ten Shadows',
    user: 'Megumi Fushiguro',
    clanId: 'zenin',
    type: 'Inherited',
    grade: 'Grade 1',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/7/77/Ten_Shadows_Technique_Profile.png',
    desc: 'Uses shadows as a liquid medium to summon ten distinct shikigami. Requires an exorcism ritual to tame them.',
    abilities: [
      { name: 'Divine Dogs', effect: 'Twin wolves. If one dies, its power flows into the other (Totality).' },
      { name: 'Mahoraga', effect: 'The ultimate summon. Its wheel adapts to any phenomenon it experiences.' },
      { name: 'Nue', effect: 'Owl-like chimera capable of electric shocks and flight.' }
    ],
    domain: 'Chimera Shadow Garden',
    domainDesc: 'Floods the area with fluid shadows, allowing unlimited clones and summons.'
  },
  {
    id: 'idle-gamble',
    name: 'Idle Death Gamble',
    user: 'Kinji Hakari',
    clanId: 'unknown',
    type: 'Domain Based',
    grade: 'Special Grade 1',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/e/e0/Hakari_dance.png',
    desc: 'A technique that only exists as a Domain Expansion. It manifests a pachinko machine based on a romance manga.',
    abilities: [
      { name: 'Probability Shift', effect: 'The user can roll for a "Jackpot" (1/239 chance).' },
      { name: 'Jackpot Mode', effect: ' grants infinite Cursed Energy and automatic Reverse Cursed Technique for 4 minutes and 11 seconds.' }
    ],
    domain: 'Idle Death Gamble',
    domainDesc: 'Forces the opponent to participate in a pachinko game. Violence is allowed during the spins.'
  },
  {
    id: 'deadly-sentencing',
    name: 'Deadly Sentencing',
    user: 'Hiromi Higuruma',
    clanId: 'unknown',
    type: 'Domain Based',
    grade: 'Grade 1',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/9/94/Higuruma_Anime.jpg',
    desc: 'A legal-themed technique that forbids violence and forces a trial.',
    abilities: [
      { name: 'Judgeman', effect: 'A shikigami that knows everything about the target and acts as prosecutor.' },
      { name: 'Confiscation', effect: 'Removes the opponent\'s Cursed Technique if found guilty.' },
      { name: 'Death Penalty', effect: 'Grants the Executioner\'s Sword, which kills on one touch.' }
    ],
    domain: 'Deadly Sentencing',
    domainDesc: 'A non-lethal domain that creates a courtroom. Acts of violence are physically impossible inside.'
  },
  {
    id: 'blood',
    name: 'Blood Manipulation',
    user: 'Choso / Kamo',
    clanId: 'kamo',
    type: 'Inherited',
    grade: 'Grade 1',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/a/a2/Choso_Anime_Design.png',
    desc: 'Complete control over one\'s own blood, including shape, temperature, and composition.',
    abilities: [
      { name: 'Piercing Blood', effect: 'Fires compressed blood at the speed of sound.' },
      { name: 'Supernova', effect: 'Detonates multiple orbs of compressed blood omnidirectionally.' },
      { name: 'Flowing Red Scale', effect: 'Dopes the body\'s pulse and temperature for superhuman stats.' }
    ],
    domain: 'Unknown',
    domainDesc: 'Typically relies on Simple Domain or high-level barrier techniques instead.'
  },
  {
    id: 'idle-transfiguration',
    name: 'Idle Transfiguration',
    user: 'Mahito',
    clanId: 'curse',
    type: 'Innate',
    grade: 'Special',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/b3/Idle_Transfiguration_Anime.png',
    desc: 'Reshapes the soul to reshape the body. Based on the theory that "The Soul Precedes the Body".',
    abilities: [
      { name: 'Soul Multiplicity', effect: 'Fuses weak souls together to create explosive reactions.' },
      { name: 'Instant Spirit Body', effect: 'A true, armored form designed for killing.' }
    ],
    domain: 'Self-Embodiment of Perfection',
    domainDesc: 'Automatically touches the soul of anyone inside.'
  },
  {
    id: 'projection',
    name: 'Projection Sorcery',
    user: 'Naoya Zenin',
    clanId: 'zenin',
    type: 'Inherited',
    grade: 'Special Grade 1',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/3/30/Naobito_Zenin_Anime_Design.png',
    desc: 'Divides 1 second into 24 frames. Traces a path that must be followed.',
    abilities: [
      { name: '24 FPS Rule', effect: 'Touching an enemy forces them to follow 24 FPS or freeze for 1 second.' },
      { name: 'Subsonic Acceleration', effect: 'Stacking frames allows for extreme speed (Mach 3).' }
    ],
    domain: 'Time Cell Moon Palace',
    domainDesc: 'Applies the 24 FPS rule to individual cells, shearing the body.'
  },
  {
    id: 'star-rage',
    name: 'Star Rage',
    user: 'Yuki Tsukumo',
    clanId: 'unknown',
    type: 'Innate',
    grade: 'Special',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/6/6e/Yuki_Tsukumo_Anime_Design.png',
    desc: 'Adds "Virtual Mass" to the user, increasing force without weight.',
    abilities: [
      { name: 'Garuda', effect: 'A shikigami tool imbued with mass.' },
      { name: 'Black Hole', effect: 'Adds infinite mass to self, creating a singularity that destroys the planet.' }
    ],
    domain: 'Unknown',
    domainDesc: 'Confirmed to exist but effects remain unrevealed.'
  },
  {
    id: 'comedian',
    name: 'Comedian',
    user: 'Fumihiko Takaba',
    clanId: 'unknown',
    type: 'Innate',
    grade: 'Unknown',
    img: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/7/74/Fumihiko_Takaba_Manga_Design.png',
    desc: 'Reality warping. Anything the user finds funny becomes reality.',
    abilities: [
      { name: 'Ignorance Vow', effect: 'The user must not know they are using a technique.' },
      { name: 'Scenario Manifestation', effect: 'Can negate damage or create objects for a "bit".' }
    ],
    domain: 'None',
    domainDesc: 'The technique functions as a constantly active reality overwrite.'
  }
];

// ==========================================
// 📜 ARCHIVE 2: WORLD LORE (Mechanics)
// ==========================================
const LORE_DB = [
  {
    id: 'black-box',
    title: 'The "Black Box" (Fuga)',
    tag: 'Neurology',
    content: 'The brain acts as a black box storage device for sorcery. High-level sorcerers can access this to swap between multiple stored techniques.'
  },
  {
    id: 'rct',
    title: 'Reverse Cursed Technique',
    tag: 'Math',
    content: 'Not a healing spell, but a mathematical operation. Cursed Energy is negative (-). Multiplying Negative x Negative = Positive Energy (+), which creates matter and heals.'
  },
  {
    id: 'heavenly-restriction',
    title: 'Heavenly Restriction',
    tag: 'Binding Vow',
    content: 'A non-consensual binding vow at birth. Toji Fushiguro had 0 CE in exchange for superhuman prowess, making him invisible to barriers.'
  },
  {
    id: 'six-eyes',
    title: 'Six Eyes (Rikugan)',
    tag: 'Biological',
    content: 'An ocular trait of the Gojo clan. It allows atomic-level perception of CE and reduces energy consumption to infinitesimally zero.'
  },
  {
    id: 'binding-vow',
    title: 'Binding Vows (Shibari)',
    tag: 'Contract',
    content: 'The contract law of Jujutsu. "Revealing One\'s Hand" (explaining your technique) increases its output. Sacrificing a limb can reinforce the rest of the body.'
  }
];

// ==========================================
// ⛩️ ARCHIVE 3: GREAT CLANS (Connection Hub)
// ==========================================
const CLAN_DB = [
  {
    id: 'gojo',
    name: 'Gojo Clan',
    status: 'One Man Army',
    desc: 'Descended from Sugawara no Michizane. Currently defined solely by Satoru Gojo.',
    trait: 'Six Eyes & Limitless'
  },
  {
    id: 'zenin',
    name: 'Zenin Clan',
    status: 'Destroyed',
    desc: 'Values power above all. Known for high-grade inherited techniques and vast armory.',
    trait: 'Ten Shadows, Projection Sorcery'
  },
  {
    id: 'kamo',
    name: 'Kamo Clan',
    status: 'Active',
    desc: 'Traditionalists who value blood purity. Masters of Blood Manipulation.',
    trait: 'Blood Manipulation'
  },
  {
    id: 'curse',
    name: 'Disaster Curses',
    status: 'Exorcised',
    desc: 'Special grade curses born from the fear of nature and humanity.',
    trait: 'Domain Expansion'
  },
  {
    id: 'unknown',
    name: 'Unaffiliated',
    status: 'N/A',
    desc: 'Sorcerers operating outside the Three Great Families.',
    trait: 'Various'
  }
];

const wikiTitleToUrl = (title) => {
  const slug = title.replace(/\s+/g, '_').replace(/[()]/g, '');
  return `${WIKI_BASE}/${encodeURIComponent(slug)}`;
};

const buildReaderUrl = (url) => {
  const normalized = url.startsWith('http') ? url : `https://${url}`;
  return `https://r.jina.ai/${normalized}`;
};

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [prompt, setPrompt] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [assistantError, setAssistantError] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [wikiUrl, setWikiUrl] = useState(DEFAULT_WIKI_PAGE);
  const [wikiSummary, setWikiSummary] = useState('');
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState('');
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdfNames, setSelectedPdfNames] = useState([]);
  const [pdfError, setPdfError] = useState('');

  const filteredTechs = TECHNIQUE_DB.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const selectedPdfText = useMemo(() => {
    return pdfFiles
      .filter((file) => selectedPdfNames.includes(file.name))
      .map((file) => `PDF: ${file.name}\n${file.text}`)
      .join('\n\n');
  }, [pdfFiles, selectedPdfNames]);

  const contextBlock = useMemo(() => {
    const sections = [];
    if (wikiSummary) {
      sections.push(`WIKI SOURCE (${wikiUrl})\n${wikiSummary}`);
    }
    if (selectedPdfText) {
      sections.push(`LOCAL PDF NOTES\n${selectedPdfText}`);
    }
    return sections.join('\n\n');
  }, [selectedPdfText, wikiSummary, wikiUrl]);

  const navigateTo = (view, item) => {
    setSelectedItem(item);
    setCurrentView(view);
  };

  const handleWikiFetch = async () => {
    setWikiLoading(true);
    setWikiError('');
    try {
      const response = await fetch(buildReaderUrl(wikiUrl));
      if (!response.ok) {
        throw new Error('Failed to fetch the wiki content.');
      }
      const text = await response.text();
      const trimmed = text.replace(/\s+$/g, '').slice(0, 2400);
      setWikiSummary(trimmed);
    } catch (error) {
      setWikiError(error.message || 'Unable to load wiki content.');
    } finally {
      setWikiLoading(false);
    }
  };

  const handlePdfUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }
    setPdfError('');

    try {
      const pdfjsLib = await pdfJsLoader();
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';
      const parsed = [];
      for (const file of files) {
        const data = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        let text = '';
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(' ');
          text += `\n${pageText}`;
        }
        parsed.push({ name: file.name, text: text.trim(), pages: pdf.numPages });
      }
      setPdfFiles((prev) => {
        const names = new Set(prev.map((file) => file.name));
        const merged = [...prev];
        for (const entry of parsed) {
          if (!names.has(entry.name)) {
            merged.push(entry);
          }
        }
        return merged;
      });
      setSelectedPdfNames((prev) => {
        const next = new Set(prev);
        parsed.forEach((file) => next.add(file.name));
        return Array.from(next);
      });
    } catch (error) {
      setPdfError('We could not parse one of the PDFs. Try a different file.');
    }
  };

  const handleAskGemini = async () => {
    if (!apiKey.trim()) {
      setAssistantError('Add your Gemini API key to continue.');
      return;
    }
    if (!prompt.trim()) {
      setAssistantError('Ask a question or give a task first.');
      return;
    }

    setAssistantError('');
    setAssistantLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: modelName });
      const composedPrompt = contextBlock
        ? `You are a Jujutsu Kaisen research assistant. Use the context below when relevant.\n\n${contextBlock}\n\nUSER REQUEST:\n${prompt}`
        : `You are a Jujutsu Kaisen research assistant.\n\nUSER REQUEST:\n${prompt}`;
      const result = await model.generateContent(composedPrompt);
      setAssistantResponse(result.response.text());
    } catch (error) {
      setAssistantError(error.message || 'Gemini request failed.');
    } finally {
      setAssistantLoading(false);
    }
  };

  const Dashboard = () => (
    <div className="p-10 animate-fadeIn">
      <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600 mb-2">
        JUJUTSU ARCHIVE
      </h1>
      <p className="text-gray-400 mb-12 uppercase tracking-widest">Special Grade Clearance /// System Ver 6.0</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div onClick={() => setCurrentView('list-techniques')} className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-purple-500 cursor-pointer group transition-all hover:-translate-y-2">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚔️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Technique Registry</h2>
          <p className="text-gray-500 text-sm">Access the compendium of 139 combat arts.</p>
        </div>

        <div onClick={() => setCurrentView('list-lore')} className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-blue-500 cursor-pointer group transition-all hover:-translate-y-2">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📖</div>
          <h2 className="text-2xl font-bold text-white mb-2">World Mechanics</h2>
          <p className="text-gray-500 text-sm">Physics of Cursed Energy, Vows, and Biology.</p>
        </div>

        <div onClick={() => setCurrentView('list-clans')} className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-green-500 cursor-pointer group transition-all hover:-translate-y-2">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⛩️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Clan Database</h2>
          <p className="text-gray-500 text-sm">Lineage data for Gojo, Zenin, and Kamo.</p>
        </div>

        <div onClick={() => setCurrentView('research-console')} className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-pink-500 cursor-pointer group transition-all hover:-translate-y-2">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧭</div>
          <h2 className="text-2xl font-bold text-white mb-2">Research Console</h2>
          <p className="text-gray-500 text-sm">Gemini prompts, wiki extraction, and PDF notes.</p>
        </div>
      </div>
    </div>
  );

  const TechniqueView = ({ tech }) => {
    const clan = CLAN_DB.find((c) => c.id === tech.clanId);

    return (
      <div className="flex flex-col h-full bg-black relative overflow-y-auto">
        <button onClick={() => setCurrentView('list-techniques')} className="absolute top-6 left-6 z-50 bg-black/50 px-4 py-2 rounded-full border border-white/20 hover:bg-white text-white hover:text-black transition-all">
          ← Back
        </button>

        <div className="h-96 relative w-full shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>
          <img src={tech.img} className="w-full h-full object-cover opacity-80" alt={tech.name} />
          <div className="absolute bottom-10 left-10 z-20">
            {clan && (
              <button
                onClick={() => navigateTo('clan-detail', clan)}
                className="px-3 py-1 bg-purple-900/50 hover:bg-purple-600 border border-purple-500/50 text-purple-200 hover:text-white text-xs font-bold uppercase tracking-widest rounded mb-4 transition-colors"
              >
                {clan.name} ↗
              </button>
            )}
            <h1 className="text-6xl font-black text-white drop-shadow-2xl mb-2">{tech.name}</h1>
            <p className="text-2xl text-gray-300 font-light">User: {tech.user}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={wikiTitleToUrl(tech.name)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-blue-500/50 text-blue-200 rounded-full hover:bg-blue-500 hover:text-white transition"
              >
                Open on Wiki ↗
              </a>
              <button
                onClick={() => {
                  setWikiUrl(wikiTitleToUrl(tech.name));
                  setCurrentView('research-console');
                }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-purple-500/50 text-purple-200 rounded-full hover:bg-purple-500 hover:text-white transition"
              >
                Send to Research Console
              </button>
            </div>
          </div>
        </div>

        <div className="p-10 max-w-4xl mx-auto w-full">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Official Description</h3>
            <p className="text-gray-400 leading-relaxed text-lg border-l-4 border-purple-600 pl-6">{tech.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {tech.abilities.map((ab, i) => (
              <div key={i} className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors">
                <h4 className="text-purple-400 font-bold mb-2">{ab.name}</h4>
                <p className="text-sm text-gray-400">{ab.effect}</p>
              </div>
            ))}
          </div>

          <div className="relative group overflow-hidden rounded-2xl border border-red-900/30 p-8 bg-gradient-to-r from-red-900/10 to-black">
            <div className="text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-2">Domain Expansion</div>
            <h2 className="text-4xl font-black text-white mb-4">{tech.domain}</h2>
            <p className="text-gray-300 italic">"{tech.domainDesc}"</p>
          </div>
        </div>
      </div>
    );
  };

  const ClanView = ({ clan }) => {
    const clanMembers = TECHNIQUE_DB.filter((t) => t.clanId === clan.id);

    return (
      <div className="p-10 h-full overflow-y-auto bg-[#050505]">
        <button onClick={() => setCurrentView('list-clans')} className="mb-8 text-gray-500 hover:text-white">← Return to Database</button>
        <h1 className="text-6xl font-black text-white mb-4">{clan.name}</h1>
        <p className="text-xl text-gray-400 mb-8 border-l-4 border-green-600 pl-6">{clan.desc}</p>
        <div className="flex flex-wrap gap-3 mb-10">
          <a
            href={wikiTitleToUrl(clan.name)}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-green-500/50 text-green-200 rounded-full hover:bg-green-500 hover:text-white transition"
          >
            Open clan on Wiki ↗
          </a>
          <button
            onClick={() => {
              setWikiUrl(wikiTitleToUrl(clan.name));
              setCurrentView('research-console');
            }}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-purple-500/50 text-purple-200 rounded-full hover:bg-purple-500 hover:text-white transition"
          >
            Send to Research Console
          </button>
        </div>

        <h3 className="text-2xl font-bold text-white mb-6">Recorded Techniques</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clanMembers.map((tech) => (
            <div onClick={() => navigateTo('technique-detail', tech)} key={tech.id} className="bg-[#111] p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-[#1a1a1a] border border-white/5">
              <img src={tech.img} className="w-16 h-16 rounded object-cover" alt="" />
              <div>
                <div className="font-bold text-white">{tech.name}</div>
                <div className="text-xs text-gray-500">{tech.user}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ResearchConsole = () => (
    <div className="p-10 h-full overflow-y-auto">
      <button onClick={() => setCurrentView('dashboard')} className="mb-6 text-gray-500 hover:text-white">← Dashboard</button>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold text-white">Gemini Assistant</h2>
              <span className="text-xs font-mono text-purple-400">Local session · API key stays in browser</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="text-sm text-gray-400">
                Gemini API Key
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Paste your Gemini key"
                  className="mt-2 w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                />
              </label>
              <label className="text-sm text-gray-400">
                Model
                <select
                  value={modelName}
                  onChange={(event) => setModelName(event.target.value)}
                  className="mt-2 w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
                >
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
              </label>
            </div>
            <label className="text-sm text-gray-400">
              Prompt
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask about techniques, clans, or summarize your wiki/PDF context..."
                className="mt-2 w-full min-h-[140px] bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={handleAskGemini}
                className="px-5 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-500 transition"
                disabled={assistantLoading}
              >
                {assistantLoading ? 'Summoning...' : 'Send to Gemini'}
              </button>
              <button
                onClick={() => {
                  setPrompt('');
                  setAssistantResponse('');
                  setAssistantError('');
                }}
                className="px-5 py-2 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/40 transition"
              >
                Clear
              </button>
            </div>
            {assistantError && <div className="mt-4 text-sm text-red-400">{assistantError}</div>}
            {assistantResponse && (
              <div className="mt-6 bg-black/60 border border-white/10 rounded-xl p-4">
                <div className="text-xs uppercase tracking-widest text-purple-300 mb-2">Gemini Response</div>
                <div className="prose prose-invert max-w-none text-sm">
                  <ReactMarkdown>{assistantResponse}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Wiki Extraction</h2>
            <p className="text-sm text-gray-400 mb-4">Fetch any JJK wiki page, skim the text, and feed it into Gemini. Links open in a new tab for deeper browsing.</p>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-4">
              <input
                type="url"
                value={wikiUrl}
                onChange={(event) => setWikiUrl(event.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleWikiFetch}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
              >
                {wikiLoading ? 'Extracting…' : 'Extract'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {WIKI_SPOTLIGHTS.map((spotlight) => (
                <button
                  key={spotlight.url}
                  onClick={() => setWikiUrl(spotlight.url)}
                  className="px-3 py-1 rounded-full border border-blue-500/30 text-blue-200 text-xs hover:bg-blue-500/20 transition"
                >
                  {spotlight.label}
                </button>
              ))}
              <a
                href={wikiUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-white/10 text-gray-300 text-xs hover:text-white hover:border-white/40 transition"
              >
                Open in new tab ↗
              </a>
            </div>
            {wikiError && <div className="text-sm text-red-400 mb-3">{wikiError}</div>}
            <textarea
              value={wikiSummary}
              onChange={(event) => setWikiSummary(event.target.value)}
              placeholder="Extracted wiki text shows here. You can edit it before sending to Gemini."
              className="w-full min-h-[160px] bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Local PDF Vault</h2>
            <p className="text-sm text-gray-400 mb-4">Upload PDFs to parse their text locally. Select which files should be included in Gemini context.</p>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handlePdfUpload}
              className="block w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-semibold hover:file:bg-purple-500"
            />
            {pdfError && <div className="text-sm text-red-400 mt-3">{pdfError}</div>}
            <div className="mt-4 space-y-3">
              {pdfFiles.length === 0 && <div className="text-xs text-gray-500">No PDFs loaded yet.</div>}
              {pdfFiles.map((file) => (
                <label key={file.name} className="flex items-start gap-3 bg-black/40 border border-white/5 rounded-lg p-3">
                  <input
                    type="checkbox"
                    checked={selectedPdfNames.includes(file.name)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSelectedPdfNames((prev) => {
                        if (checked) {
                          return [...new Set([...prev, file.name])];
                        }
                        return prev.filter((name) => name !== file.name);
                      });
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">{file.name}</div>
                    <div className="text-xs text-gray-500">{file.pages} pages parsed</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Context Preview</h2>
            <p className="text-xs text-gray-400 mb-3">Gemini will receive the wiki extract and selected PDF snippets below.</p>
            <pre className="whitespace-pre-wrap text-xs text-gray-300 bg-black/60 border border-white/10 rounded-lg p-3 max-h-[320px] overflow-y-auto">
              {contextBlock || 'No context selected yet.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      <nav className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded rotate-45 flex items-center justify-center">
            <span className="-rotate-45 font-bold text-white">呪</span>
          </div>
          <span className="font-bold text-xl tracking-wider">
            JJK <span className="text-purple-500">NET</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs font-mono text-gray-600">
          <button onClick={() => setCurrentView('research-console')} className="hover:text-white">Research Console</button>
          <span>•</span>
          <a href={DEFAULT_WIKI_PAGE} target="_blank" rel="noreferrer" className="hover:text-white">
            Wiki Portal ↗
          </a>
        </div>
      </nav>

      <div className="h-[calc(100vh-64px)] overflow-hidden">
        {currentView === 'dashboard' && <Dashboard />}

        {currentView === 'list-techniques' && (
          <div className="flex h-full">
            <div className="w-full max-w-5xl mx-auto p-10 overflow-y-auto">
              <button onClick={() => setCurrentView('dashboard')} className="mb-6 text-gray-500 hover:text-white">← Dashboard</button>
              <input
                type="text"
                placeholder="Filter Techniques..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl mb-8 text-xl focus:border-purple-500 outline-none"
              />
              <div className="space-y-2">
                {filteredTechs.map((tech) => (
                  <div
                    key={tech.id}
                    onClick={() => navigateTo('technique-detail', tech)}
                    className="group flex items-center gap-6 p-4 rounded-xl hover:bg-[#111] border border-transparent hover:border-white/10 cursor-pointer transition-all"
                  >
                    <img src={tech.img} className="w-20 h-20 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-300 group-hover:text-purple-400">{tech.name}</h3>
                      <p className="text-gray-600 group-hover:text-gray-400">{tech.user} • {tech.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'list-lore' && (
          <div className="p-10 max-w-4xl mx-auto overflow-y-auto h-full">
            <button onClick={() => setCurrentView('dashboard')} className="mb-6 text-gray-500 hover:text-white">← Dashboard</button>
            <h1 className="text-4xl font-bold mb-8 text-blue-500">World Building & Mechanics</h1>
            <div className="grid gap-6">
              {LORE_DB.map((lore) => (
                <div key={lore.id} className="bg-[#111] p-6 rounded-xl border-l-4 border-blue-600">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{lore.title}</h3>
                    <span className="text-[10px] uppercase bg-blue-900/30 text-blue-300 px-2 py-1 rounded">{lore.tag}</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{lore.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'list-clans' && (
          <div className="p-10 max-w-6xl mx-auto h-full overflow-y-auto">
            <button onClick={() => setCurrentView('dashboard')} className="mb-6 text-gray-500 hover:text-white">← Dashboard</button>
            <h1 className="text-4xl font-bold mb-8 text-green-500">The Great Clans</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CLAN_DB.filter((c) => c.id !== 'unknown').map((clan) => (
                <div
                  key={clan.id}
                  onClick={() => navigateTo('clan-detail', clan)}
                  className="bg-[#111] p-8 rounded-xl border border-white/5 hover:border-green-500 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <h2 className="text-3xl font-black text-white mb-2">{clan.name}</h2>
                  <p className="text-gray-400 mb-4">{clan.desc}</p>
                  <div className="text-xs font-mono text-green-600 bg-green-900/10 p-2 rounded inline-block">TRAIT: {clan.trait}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'research-console' && <ResearchConsole />}
        {currentView === 'technique-detail' && <TechniqueView tech={selectedItem} />}
        {currentView === 'clan-detail' && <ClanView clan={selectedItem} />}
      </div>
    </div>
  );
}
