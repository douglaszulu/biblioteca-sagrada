import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Shield, 
  Compass, 
  BookOpen, 
  Play, 
  Square, 
  Users, 
  PenTool, 
  Check, 
  Volume2, 
  Clock, 
  Search, 
  Plus, 
  Feather, 
  HelpCircle,
  BookOpenCheck,
  Bookmark,
  Share2,
  Trash2,
  Lock,
  User,
  HeartHandshake,
  Menu,
  X
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import { STATIC_PRAYERS, STATIC_PSALMS, GUIDED_AUDIOS, STATIC_NOVENAS } from './data';
import { TabType, Prayer, Psalm, GuidedAudio, Novena, SavedPrayer, CommunityPrayer, UserProfile } from './types';
import { ambientSound } from './utils/audioGen';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [tab, setTab] = useState<TabType>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // User Profile State (Local-only, no database required)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('biblioteca_sagrada_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileFocus, setProfileFocus] = useState<'protecao' | 'prosperidade' | 'cura_interior' | 'restauracao' | 'fortalecimento' | 'paz_geral'>('cura_interior');

  useEffect(() => {
    if (userProfile) {
      setProfileName(userProfile.name);
      setProfileEmail(userProfile.email);
      setProfileFocus(userProfile.devotionalFocus);
    }
  }, [isProfileModalOpen, userProfile]);

  // App States
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(5); // 0 to 10
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrayerCategory, setSelectedPrayerCategory] = useState<string>('todos');
  
  // Focused reading mode for prayers (gives a beautiful full page, larger typography experience)
  const [focusedPrayer, setFocusedPrayer] = useState<Prayer | null>(null);
  const [focusedPsalm, setFocusedPsalm] = useState<Psalm | null>(null);
  const [parchmentTheme, setParchmentTheme] = useState(false);

  // Completed novena days stored in local storage
  const [completedNovenaDays, setCompletedNovenaDays] = useState<Record<string, number[]>>(() => {
    try {
      const saved = localStorage.getItem('novena_completed_days');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Saved Custom prayers (AI ones)
  const [savedPrayers, setSavedPrayers] = useState<SavedPrayer[]>(() => {
    try {
      const saved = localStorage.getItem('custom_saved_prayers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Community State
  const [communityPrayers, setCommunityPrayers] = useState<CommunityPrayer[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [newPrayerRequest, setNewPrayerRequest] = useState('');
  const [newPrayerName, setNewPrayerName] = useState('');
  const [newPrayerCategory, setNewPrayerCategory] = useState<'protecao' | 'prosperidade' | 'cura_interior' | 'restauracao' | 'fortalecimento' | 'outros'>('cura_interior');
  const [newPrayerIsAnonymous, setNewPrayerIsAnonymous] = useState(true);
  const [submittingCommunity, setSubmittingCommunity] = useState(false);
  const [prayedIds, setPrayedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('prayed_request_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI custom prayer state
  const [aiFeeling, setAiFeeling] = useState('ansiedade');
  const [aiSituation, setAiSituation] = useState('');
  const [aiNameToPrayFor, setAiNameToPrayFor] = useState('');
  const [aiPrayerType, setAiPrayerType] = useState('cura_interior');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [currentGeneratedPrayer, setCurrentGeneratedPrayer] = useState<SavedPrayer | null>(null);
  const [aiError, setAiError] = useState('');

  // Persist novenas and local state updates
  useEffect(() => {
    localStorage.setItem('novena_completed_days', JSON.stringify(completedNovenaDays));
  }, [completedNovenaDays]);

  useEffect(() => {
    localStorage.setItem('custom_saved_prayers', JSON.stringify(savedPrayers));
  }, [savedPrayers]);

  useEffect(() => {
    localStorage.setItem('prayed_request_ids', JSON.stringify(prayedIds));
  }, [prayedIds]);

  // Prefill dynamic details when userProfile is loaded or updated
  useEffect(() => {
    if (userProfile?.name) {
      if (!newPrayerName) {
        setNewPrayerName(userProfile.name);
        setNewPrayerIsAnonymous(false);
      }
      if (!aiNameToPrayFor) {
        setAiNameToPrayFor(userProfile.name);
      }
    }
  }, [userProfile]);

  // Handle ambient sound lifecycle
  useEffect(() => {
    if (activeAudio) {
      const targetAudio = GUIDED_AUDIOS.find(a => a.id === activeAudio);
      if (targetAudio) {
        ambientSound.start(targetAudio.audioMode);
        ambientSound.setVolume(audioVolume);
      }
    } else {
      ambientSound.stop();
    }
    return () => {
      ambientSound.stop();
    };
  }, [activeAudio]);

  useEffect(() => {
    ambientSound.setVolume(audioVolume);
  }, [audioVolume]);

  // Fetch community prayers
  const fetchCommunityPrayers = async () => {
    setLoadingCommunity(true);
    try {
      const response = await fetch('/api/community-prayers');
      if (response.ok) {
        const data = await response.json();
        setCommunityPrayers(data);
      }
    } catch (err) {
      console.error('Error fetching community prayers:', err);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    if (tab === 'comunidade' || tab === 'home') {
      fetchCommunityPrayers();
    }
  }, [tab]);

  // Pray for someone request
  const handlePrayForRequest = async (id: string) => {
    if (prayedIds.includes(id)) return; // Prevent double pray in same session
    
    // Optimistic UI update
    setCommunityPrayers(prev => 
      prev.map(p => p.id === id ? { ...p, prayersCount: p.prayersCount + 1 } : p)
    );
    setPrayedIds(prev => [...prev, id]);

    // Simple audio cue for praying (soft holy beep)
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const testCtx = new AudioCtxClass();
        const osc = testCtx.createOscillator();
        const gain = testCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, testCtx.currentTime); // G Note, very clear and warm
        gain.gain.setValueAtTime(0.05, testCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, testCtx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(testCtx.destination);
        osc.start();
        setTimeout(() => osc.stop(), 1200);
      }
    } catch {}

    try {
      await fetch(`/api/community-prayers/${id}/pray`, { method: 'POST' });
    } catch (err) {
      console.error('Error recording prayer:', err);
    }
  };

  // Submit community prayer request
  const handleSubmitCommunityPrayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPrayerRequest.trim()) return;

    setSubmittingCommunity(true);
    try {
      const response = await fetch('/api/community-prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPrayerIsAnonymous ? 'Anônimo' : (newPrayerName || userProfile?.name || 'Intercessor'),
          request: newPrayerRequest,
          category: newPrayerCategory
        })
      });

      if (response.ok) {
        const created = await response.json();
        setCommunityPrayers(prev => [created, ...prev]);
        setNewPrayerRequest('');
        setNewPrayerName(userProfile?.name || '');
        setNewPrayerIsAnonymous(!userProfile);
      }
    } catch (err) {
      console.error('Error submitting community prayer:', err);
    } finally {
      setSubmittingCommunity(false);
    }
  };

  // Generate Custom AI Prayer
  const handleGenerateAiPrayer = async (e: FormEvent) => {
    e.preventDefault();
    setGeneratingAi(true);
    setAiError('');
    setCurrentGeneratedPrayer(null);

    try {
      const response = await fetch('/api/generate-prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeling: aiFeeling,
          situation: aiSituation,
          nameToPrayFor: aiNameToPrayFor,
          prayerType: aiPrayerType,
          userEmail: userProfile?.email || 'exemplo@dominio.com'
        })
      });

      if (!response.ok) {
        throw new Error('Falha no servidor ao gerar a sua oração sob medida.');
      }

      const data = await response.json();
      const generated: SavedPrayer = {
        id: 'ai-' + Date.now(),
        timestamp: new Date().toLocaleDateString('pt-BR'),
        title: data.title,
        greeting: data.greeting,
        prayerParagraphs: data.prayerParagraphs,
        bibleVerse: data.bibleVerse,
        bibleText: data.bibleText,
        spiritualExercise: data.spiritualExercise,
        feeling: aiFeeling,
        situation: aiSituation
      };

      setCurrentGeneratedPrayer(generated);
    } catch (err: any) {
      setAiError(err.message || 'Houve um imprevisto na conexão. Por favor tente novamente.');
    } finally {
      setGeneratingAi(false);
    }
  };

  // Save user profile locally
  const handleSaveProfile = (name: string, email: string, focus: typeof profileFocus) => {
    const newProfile: UserProfile = {
      name: name.trim(),
      email: email.trim() || 'exemplo@dominio.com',
      devotionalFocus: focus
    };
    setUserProfile(newProfile);
    localStorage.setItem('biblioteca_sagrada_user_profile', JSON.stringify(newProfile));
    setIsProfileModalOpen(false);
  };

  // Save AI prayer to list
  const handleSaveCurrentPrayer = () => {
    if (!currentGeneratedPrayer) return;
    if (savedPrayers.some(p => p.title === currentGeneratedPrayer.title)) return;
    setSavedPrayers(prev => [currentGeneratedPrayer, ...prev]);
    
    // Quick indicator toast emulation or visual feedback
    alert('Sua oração sob medida foi guardada em seus Devocionais Salvos.');
  };

  // Delete saved prayer
  const handleDeleteSavedPrayer = (id: string) => {
    setSavedPrayers(prev => prev.filter(p => p.id !== id));
  };

  // Switch completion of Novena day
  const toggleNovenaDay = (novenaId: string, dayNum: number) => {
    setCompletedNovenaDays(prev => {
      const currentList = prev[novenaId] || [];
      const updatedList = currentList.includes(dayNum)
        ? currentList.filter(d => d !== dayNum)
        : [...currentList, dayNum].sort((a,b) => a - b);
      return { ...prev, [novenaId]: updatedList };
    });
  };

  // Helpers for category labeling
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'protecao': return '🛡️ Proteção';
      case 'prosperidade': return '💰 Prosperidade';
      case 'cura_interior': return '🌸 Cura Interior';
      case 'restauracao': return '🏡 Restauração';
      case 'fortalecimento': return '💪 Fortalecimento';
      case 'paz_geral': return '✨ Paz Geral';
      default: return '✝️ Devocional';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protecao': return 'bg-amber-950/40 text-amber-400 border-amber-800/40';
      case 'prosperidade': return 'bg-yellow-950/40 text-yellow-400 border-yellow-800/40';
      case 'cura_interior': return 'bg-rose-950/40 text-rose-400 border-rose-800/40';
      case 'paz_geral': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
      case 'restauracao': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
      case 'fortalecimento': return 'bg-blue-950/40 text-blue-400 border-blue-800/40';
      default: return 'bg-slate-800/40 text-slate-300 border-slate-700/40';
    }
  };

  // Render Intro/Poem Landing page first if not entered yet
  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />;
  }

  // Render Registration page after Landing Page but before main app if no profile is set yet
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background lights */}
        <div className="absolute top-1/4 right-10 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800/85 rounded-2xl p-6 md:p-8 space-y-6 overflow-hidden shadow-2xl text-left"
        >
          {/* Background amber glow */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

          {/* Logo brand */}
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif-sacred text-base tracking-widest text-amber-500 font-bold leading-none">BIBLIOTECA</h2>
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mt-1">SAGRADA</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-serif-reading font-semibold text-slate-100">
              Crie seu Perfil de Fé
            </h3>
            <p className="text-xs text-amber-500 font-mono tracking-wider uppercase">Seu Altar de Fé Pessoal</p>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed font-serif-reading">
            Inscreva seu nome e intenção para personalizar suas preces, áudios e intercessões instantaneamente! Seus dados são guardados <strong className="text-amber-500 font-sans uppercase text-[10px]">exclusivamente no seu aparelho</strong>.
          </p>

          <form 
            id="initial-profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!profileName.trim()) return;
              handleSaveProfile(profileName, profileEmail, profileFocus);
            }} 
            className="space-y-4"
          >
            {/* Name Input */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="initial-profile-name-input" className="text-xs font-mono text-slate-400 block font-medium">Seu Nome / Apelido para Saudação *</label>
              <input
                id="initial-profile-name-input"
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500 placeholder-slate-600 transition"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="initial-profile-email-input" className="text-xs font-mono text-slate-400 block font-medium">Seu E-mail (Opcional)</label>
              <input
                id="initial-profile-email-input"
                type="email"
                placeholder="exemplo@dominio.com"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500 placeholder-slate-600 transition"
              />
            </div>

            {/* Focus select */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="initial-profile-focus-select" className="text-xs font-mono text-slate-400 block font-medium">Seu Principal Foco Devocional</label>
              <select
                id="initial-profile-focus-select"
                value={profileFocus}
                onChange={(e) => setProfileFocus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 outline-none focus:border-amber-500 cursor-pointer transition"
              >
                <option value="cura_interior">🌸 Cura Interior & Emoções</option>
                <option value="protecao">🛡️ Proteção Celestial</option>
                <option value="prosperidade">💰 Prospecção & Ocupação</option>
                <option value="restauracao">🏡 Restauração de Família</option>
                <option value="fortalecimento">💪 Renovação de Força</option>
                <option value="paz_geral">✨ Paz Geral da Alma</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 transition active:scale-95 text-slate-950 font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer mt-2 shadow-md shadow-amber-500/10"
            >
              Ativar Meu Perfil de Fé & Entrar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Under Focus reading mode for prayers
  if (focusedPrayer) {
    return (
      <div className={`min-h-screen p-6 md:p-12 flex flex-col items-center justify-center transition-colors duration-500 ${
        parchmentTheme ? 'focused-parchment' : 'focused-dark bg-slate-950 text-slate-100'
      }`}>
        <div className="max-w-xl w-full space-y-8 my-6">
          <div className="flex justify-between items-center border-b pb-4 border-slate-700/30">
            <button 
              id="close-prayer-focus"
              onClick={() => setFocusedPrayer(null)}
              className="px-4 py-2 text-xs font-mono tracking-widest uppercase rounded-lg border border-slate-700/40 hover:bg-slate-800/30 text-amber-500 cursor-pointer"
            >
              ← Voltar à Biblioteca
            </button>
            <button 
              id="toggle-parchment-theme"
              onClick={() => setParchmentTheme(!parchmentTheme)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border ${
                parchmentTheme ? 'border-amber-800/20 text-slate-700' : 'border-slate-800 text-slate-300'
              }`}
            >
              {parchmentTheme ? '☀️ Modo Escuro' : '⏳ Modo Pergaminho'}
            </button>
          </div>

          <div className="text-center space-y-4">
            <span className={`text-xs px-3 py-1 rounded-full border border-amber-500/30 ${parchmentTheme ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400'}`}>
              {getCategoryLabel(focusedPrayer.category)}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif-sacred font-bold text-amber-600/90 tracking-wide mt-2">
              {focusedPrayer.title}
            </h1>
            {focusedPrayer.intro && (
              <p className="italic text-sm text-slate-500 max-w-md mx-auto">
                "{focusedPrayer.intro}"
              </p>
            )}
          </div>

          <div className="space-y-6 font-serif-reading text-lg md:text-xl leading-relaxed text-left">
            {focusedPrayer.text.map((par, i) => (
              <p key={i} className="first-letter:text-3xl first-letter:font-serif-sacred first-letter:text-amber-500 first-letter:font-bold">
                {par}
              </p>
            ))}
          </div>

          {focusedPrayer.source && (
            <div className="text-right text-xs italic text-slate-500 font-mono">
              Fonte: {focusedPrayer.source}
            </div>
          )}

          <div className="pt-8 text-center">
            <p className="text-xs text-slate-400">
              Silencie sua respiração e permita que as palavras acalmem seu coração.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Under Focus reading mode for psalms
  if (focusedPsalm) {
    return (
      <div className={`min-h-screen p-6 md:p-12 flex flex-col items-center justify-center transition-colors duration-500 ${
        parchmentTheme ? 'focused-parchment' : 'focused-dark bg-slate-950 text-slate-100'
      }`}>
        <div className="max-w-2xl w-full space-y-8 my-6">
          <div className="flex justify-between items-center border-b pb-4 border-slate-700/30">
            <button 
              id="close-psalm-focus"
              onClick={() => setFocusedPsalm(null)}
              className="px-4 py-2 text-xs font-mono tracking-widest uppercase rounded-lg border border-slate-700/40 hover:bg-slate-800/30 text-amber-500 cursor-pointer"
            >
              ← Voltar aos Salmos
            </button>
            <button 
              id="toggle-parchment-theme"
              onClick={() => setParchmentTheme(!parchmentTheme)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border ${
                parchmentTheme ? 'border-amber-800/20 text-slate-700' : 'border-slate-800 text-slate-300'
              }`}
            >
              {parchmentTheme ? '☀️ Modo Escuro' : '⏳ Modo Pergaminho'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <span className="text-xs tracking-widest font-mono uppercase text-amber-500">Salmo {focusedPsalm.number}</span>
            <h1 className="text-3xl md:text-4xl font-serif-sacred font-bold text-amber-600/90 mt-1">
              {focusedPsalm.title}
            </h1>
            <p className="text-sm text-slate-500 italic">Tema: {focusedPsalm.theme}</p>
          </div>

          {/* Verses representation */}
          <div className="space-y-4 border-l-2 border-amber-500/20 pl-6 my-8 font-serif-reading text-lg md:text-xl leading-relaxed text-left">
            {focusedPsalm.verses.map((v, i) => (
              <p key={i}>
                <sup className="text-xs text-amber-500 font-sans mr-2 font-semibold">{v.number}</sup>
                {v.text}
              </p>
            ))}
          </div>

          {/* Dynamic theological reflection card */}
          <div className={`p-6 rounded-xl border ${
            parchmentTheme ? 'bg-amber-100/55 border-amber-200' : 'bg-slate-900 border-slate-800/60'
          }`}>
            <h3 className="text-sm font-sans font-bold text-amber-550/90 tracking-wider uppercase mb-2 flex items-center gap-2">
              <Feather className="w-4 h-4 text-amber-500" />
              <span>Reflexão Teológica e Refrigério</span>
            </h3>
            <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-serif-reading italic">
              {focusedPsalm.reflection}
            </p>
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs text-slate-400">
              “Escreve em tábuas de pedra o que gravas no silêncio do teu dia.”
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">
      
      {/* Decorative Warm Ambient Circle */}
      <div className="absolute top-1/4 right-10 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* MOBILE TOP NAVIGATION BAR */}
      <header className="flex md:hidden items-center justify-between bg-slate-900 border-b border-slate-800/85 px-4 py-3 sticky top-0 z-40 w-full h-16 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="font-serif-sacred text-sm tracking-widest text-amber-500 font-bold leading-none">BIBLIOTECA</h1>
            <span className="font-mono text-[8px] text-slate-400 uppercase tracking-widest block mt-0.5">SAGRADA</span>
          </div>
        </div>

        <button
          id="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/30 text-amber-500 focus:outline-none transition active:scale-95 cursor-pointer flex items-center justify-center"
          aria-label="Abrir menu"
          style={{ minWidth: '40px', minHeight: '40px' }}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop delay tap to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden"
            />

            {/* Menu container */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between z-50 md:hidden text-left"
            >
              <div className="space-y-8">
                {/* Logo Brand inside drawer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif-sacred text-sm tracking-widest text-amber-500 font-bold leading-none">BIBLIOTECA</h2>
                      <span className="font-mono text-[8px] text-slate-400 uppercase tracking-widest block mt-0.5">SAGRADA</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer flex items-center justify-center"
                    style={{ minWidth: '36px', minHeight: '36px' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links inside drawer */}
                <nav className="space-y-1.5">
                  {[
                    { id: 'home', label: 'Início', icon: Compass },
                    { id: 'oracoes', label: 'Orações', icon: BookOpenCheck },
                    { id: 'salmos', label: 'Salmos Poderosos', icon: Bookmark },
                    { id: 'audios', label: 'Áudios Guiados', icon: Volume2 },
                    { id: 'novenas', label: 'Novenas Ativas', icon: Shield },
                    { id: 'personalizado', label: 'Oração com I.A.', icon: PenTool },
                    { id: 'comunidade', label: 'Comunidade de Fé', icon: Users },
                  ].map((i) => {
                    const IconComponent = i.icon;
                    const isActive = tab === i.id;
                    return (
                      <button
                        key={i.id}
                        id={`mobile-nav-tab-${i.id}`}
                        onClick={() => {
                          setTab(i.id as TabType);
                          setSearchQuery('');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-950/40 to-amber-900/15 border border-amber-800/50 text-amber-400 shadow-md shadow-amber-950/10'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/30'
                        }`}
                        style={{ minHeight: '44px' }}
                      >
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>{i.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User Context bottom area in mobile drawer */}
              <div className="pt-6 border-t border-slate-800 text-left space-y-4">
                <div 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/50 hover:border-amber-500/10 cursor-pointer transition border border-transparent text-left"
                >
                  <div className="p-1.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate text-left">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">
                      {userProfile ? `🎯 ${getCategoryLabel(userProfile.devotionalFocus)}` : 'Intercessor'}
                    </p>
                    <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">
                      {userProfile ? userProfile.name : 'Clique para Cadastrar'}
                    </p>
                  </div>
                </div>

                <div className="text-[9px] text-slate-600 font-mono tracking-tight">
                  &copy; {new Date().getFullYear()} Biblioteca Sagrada.
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE MINI FLOATING PLAYER */}
      <AnimatePresence>
        {activeAudio && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:hidden z-30"
          >
            <div className="p-3 bg-slate-900/95 backdrop-blur-md rounded-xl border border-amber-550/30 text-xs flex flex-row items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2 max-w-[60%]">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="font-semibold text-amber-400 truncate text-[11px] text-left leading-none">
                  {GUIDED_AUDIOS.find(a => a.id === activeAudio)?.title}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={audioVolume} 
                  onChange={(e) => setAudioVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <button 
                  onClick={() => setActiveAudio(null)}
                  className="p-1 px-2.5 rounded-lg bg-red-950/40 border border-red-900/40 hover:bg-red-900/40 text-red-400 flex items-center justify-center font-mono text-[9px] uppercase font-bold cursor-pointer"
                  style={{ minHeight: '32px' }}
                >
                  Parar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT NAVIGATION COLUMN - DESKTOP */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 border-r border-slate-800/80 p-6 flex-col justify-between shrink-0 h-screen sticky top-0 text-left">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-sacred text-base tracking-widest text-amber-500 font-bold">BIBLIOTECA</h2>
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest -mt-1 block">SAGRADA</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'home', label: 'Início', icon: Compass },
              { id: 'oracoes', label: 'Orações', icon: BookOpenCheck },
              { id: 'salmos', label: 'Salmos Poderosos', icon: Bookmark },
              { id: 'audios', label: 'Áudios Guiados', icon: Volume2 },
              { id: 'novenas', label: 'Novenas Ativas', icon: Shield },
              { id: 'personalizado', label: 'Oração com I.A.', icon: PenTool },
              { id: 'comunidade', label: 'Comunidade de Fé', icon: Users },
            ].map((i) => {
              const IconComponent = i.icon;
              const isActive = tab === i.id;
              return (
                <button
                  key={i.id}
                  id={`nav-tab-${i.id}`}
                  onClick={() => { setTab(i.id as TabType); setSearchQuery(''); }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-950/40 to-amber-900/15 border border-amber-800/50 text-amber-400 shadow-md shadow-amber-950/10' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/30 border border-transparent'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{i.label}</span>
                  {i.id === 'comunidade' && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Novo
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User context information area */}
        <div id="user-context-card" className="mt-8 pt-6 border-t border-slate-850/80 text-left space-y-4">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/45 border border-slate-850 hover:bg-slate-850/50 hover:border-amber-500/25 transition cursor-pointer text-left"
          >
            <div className="p-1.5 rounded-full bg-slate-800 text-slate-300 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="truncate text-left">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-none mb-0.5">
                {userProfile ? `🎯 ${getCategoryLabel(userProfile.devotionalFocus)}` : 'Intercessor Conectado'}
              </p>
              <p className="text-xs font-semibold text-slate-300 truncate">
                {userProfile ? userProfile.name : 'Cadastre-se Grátis'}
              </p>
            </div>
          </div>

          {activeAudio && (
            <motion.div 
              layoutId="persistent-player-mini"
              className="p-3 rounded-xl bg-slate-950 border border-amber-500/20 text-xs flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Tocando áudio sagrado</span>
              </div>
              <p className="font-medium text-amber-400 truncate text-left">
                {GUIDED_AUDIOS.find(a => a.id === activeAudio)?.title}
              </p>
              
              {/* Simple Volume controls */}
              <div className="flex items-center gap-2 mt-1">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={audioVolume} 
                  onChange={(e) => setAudioVolume(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <button 
                  onClick={() => setActiveAudio(null)}
                  className="p-1 text-slate-400 hover:text-red-400 cursor-pointer flex items-center justify-center"
                  style={{ minWidth: '24px', minHeight: '24px' }}
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </div>
            </motion.div>
          )}

          <div className="text-[10px] text-slate-600 font-mono tracking-tight text-left">
            &copy; {new Date().getFullYear()} Biblioteca Sagrada.
          </div>
        </div>
      </aside>

      {/* MAIN BODY AREA */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col justify-between overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* TOP STATUS BAR */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-850 pb-6 mb-8">
          <div>
            <span className="text-xs text-amber-500 font-mono tracking-widest uppercase block mb-1">Passagem Sagrada</span>
            <p className="text-base font-serif-reading italic text-slate-200">
              "Olhai para as aves do céu... o vosso Pai celestial as alimenta." (Mateus 6:26)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Presença Divina Conosco</span>
            </div>
          </div>
        </section>

        {/* DYNAMIC CONTENT PER TAB */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* TAB: HOME */}
            {tab === 'home' && (
              <motion.div
                key="home-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Hero Banner card */}
                <div id="home-hero-card" className="relative p-6 md:p-10 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
                  
                  <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>{userProfile ? `A paz esteja com você, ${userProfile.name}!` : 'Mensagem de Paz Direta'}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-serif-sacred text-slate-100 tracking-wide font-normal">
                      Sinta-se abraçado e saiba que você <span className="text-amber-500 font-semibold italic">não está sozinho</span> nesta caminhada.
                    </h1>
                    
                    <p className="text-sm md:text-base text-slate-400 font-serif-reading leading-relaxed">
                      "Talvez não tenha sido por acaso que você chegou até aqui… Existe um momento em que o coração cansa de carregar tudo sozinho." Entre no silêncio e acolha o repouso celestial.
                    </p>

                    <div className="pt-4 flex flex-wrap gap-3">
                      <button 
                        onClick={() => setTab('personalizado')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-sans font-bold tracking-wide text-xs uppercase cursor-pointer"
                      >
                        Escrever Clamor com I.A.
                      </button>
                      <button 
                        onClick={() => setTab('audios')}
                        className="px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-300 font-sans font-semibold tracking-wide text-xs uppercase cursor-pointer"
                      >
                        Ouvir Harpa Tradicional
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid stats and devotion */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Daily Devotion Card */}
                  <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-850 flex flex-col justify-between space-y-4">
                    <div className="space-y-3 text-left">
                      <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 block font-semibold">Devocional do Dia</span>
                      <h3 className="text-xl font-serif-reading font-semibold text-slate-200">Acalmando Mentes Inquietas</h3>
                      <p className="text-sm text-slate-300 leading-relaxed font-serif-reading">
                        "Não andeis ansiosos de coisa alguma..." Diariamente, somos bombardeados por dúvidas e ansiedades sobre o amanhã. No entanto, o silêncio restaurador nos lembra que a provisão chega no tempo correto. Se hoje as portas parecem fechadas, faça silêncio na alma e confie na promessa inabalável do Guarda de Israel. Ele não dorme nem adormece.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-800/40 text-xs italic text-slate-500">
                      Inspirado no devocionário clássico de paz de São Francisco.
                    </div>
                  </div>

                  {/* Community Prayer request side widget */}
                  <div className="p-6 rounded-2xl bg-amber-950/15 border border-amber-900/30 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 text-left">
                      <h4 className="text-sm font-sans font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Comunidade Ativa</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Pessoas reais estão entregando suas aflições na Biblioteca agora. Apoie intercedendo:
                      </p>
                      
                      <div className="space-y-3 pt-2">
                        {communityPrayers.slice(0, 2).map((cp) => (
                          <div key={cp.id} className="text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-semibold text-slate-300 truncate">{cp.name}</span>
                              <span className="text-amber-500">🙏 {cp.prayersCount}</span>
                            </div>
                            <p className="text-slate-400 line-clamp-2 italic">"{cp.request}"</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setTab('comunidade')}
                      className="w-full py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider block text-center border border-amber-500/30 cursor-pointer"
                    >
                      Ver Todos Pedidos
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: ORAÇÕES */}
            {tab === 'oracoes' && (
              <motion.div
                key="oracoes-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif-sacred text-amber-500 font-semibold tracking-wide">
                      Orações Sagradas
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Coleção especial inspirada na tradição cristã para guiar o seu espírito nos momentos de luta.
                    </p>
                  </div>

                  {/* Search filter */}
                  <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Buscar orações por título..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    { id: 'todos', label: '✝️ Mostrar Todas' },
                    { id: 'protecao', label: '🛡️ Proteção' },
                    { id: 'prosperidade', label: '💰 Prosperidade' },
                    { id: 'cura_interior', label: '🌸 Cura Interior' },
                    { id: 'restauracao', label: '🏡 Restauração de Vínculos' },
                    { id: 'fortalecimento', label: '💪 Fortalecimento' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedPrayerCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        selectedPrayerCategory === cat.id
                          ? 'bg-amber-500 text-slate-950 shadow shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {STATIC_PRAYERS
                    .filter(p => selectedPrayerCategory === 'todos' || p.category === selectedPrayerCategory)
                    .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((prayer) => (
                      <div 
                        key={prayer.id}
                        className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getCategoryColor(prayer.category)}`}>
                              {getCategoryLabel(prayer.category)}
                            </span>
                            {prayer.source && (
                              <span className="text-[10px] text-slate-500 font-mono italic">
                                Fonte: {prayer.source}
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-serif-reading font-semibold text-slate-200 tracking-wide mt-1">
                            {prayer.title}
                          </h3>

                          {prayer.intro && (
                            <p className="text-xs text-slate-400 italic line-clamp-2">
                              "{prayer.intro}"
                            </p>
                          )}

                          <p className="text-xs text-slate-400 line-clamp-3 font-serif-reading leading-relaxed">
                            {prayer.text[0]}...
                          </p>
                        </div>

                        <button
                          id={`focus-prayer-${prayer.id}`}
                          onClick={() => setFocusedPrayer(prayer)}
                          className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-slate-850 hover:border-amber-500/30 text-xs font-semibold uppercase tracking-wider text-amber-500 cursor-pointer text-center"
                        >
                          📖 Modo Leitura Imersiva
                        </button>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* TAB: SALMOS */}
            {tab === 'salmos' && (
              <motion.div
                key="salmos-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif-sacred text-amber-500 font-semibold tracking-wide">
                    Salmos Poderosos
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Traduções clássicas sagradas unidas a conselhos de refrigério e explicações de fé em tempos modernos.
                  </p>
                </div>

                <div className="space-y-6">
                  {STATIC_PSALMS.map((psalm) => (
                    <div 
                      key={psalm.id}
                      className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-850 hover:border-slate-800 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/50 pb-4 mb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase font-semibold">Salmo de Proteção {psalm.number}</span>
                          <h3 className="text-xl font-serif-reading font-semibold text-slate-100">{psalm.title}</h3>
                        </div>
                        <span className="text-xs px-3 py-1 bg-slate-950 rounded-lg text-slate-400 border border-slate-850">
                          {psalm.theme}
                        </span>
                      </div>

                      {/* Display small preview of verses */}
                      <div className="space-y-2 border-l border-amber-500/10 pl-4 py-1 italic font-serif-reading text-sm text-slate-300">
                        {psalm.verses.slice(0, 2).map((v) => (
                          <p key={v.number}>
                            <sup className="text-[9px] text-amber-500 mr-1.5 font-sans font-bold">{v.number}</sup>
                            {v.text}
                          </p>
                        ))}
                        <p className="text-xs text-amber-500 tracking-wide font-mono not-italic mt-2">
                          [há outros versículos consoladores nesta passagem...]
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800/40 flex flex-wrap justify-between items-center gap-4">
                        <p className="text-[11px] text-slate-500 max-w-md font-serif-reading italic leading-normal">
                          Reflexão: "{psalm.reflection.slice(0, 110)}..."
                        </p>
                        <button
                          id={`focus-psalm-${psalm.id}`}
                          onClick={() => setFocusedPsalm(psalm)}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Meditar no Salmo Inteiro
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB:ÁUDIOS GUIADOS */}
            {tab === 'audios' && (
              <motion.div
                key="audios-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif-sacred text-amber-500 font-semibold tracking-wide">
                    Áudios Guiados de Refrigério
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Ative um áudio guiado para gerar em tempo real sons de harpa tradicional, piano espiritual ou som de chuva da providência no seu navegador.
                  </p>
                </div>

                {/* Real-time ambient audio notification bar */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 flex items-center gap-3">
                  <HeartHandshake className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    💡 <strong>Fios de Conexão:</strong> Nosso sistema utiliza tecnologia de sintetização de som binaural acústica real (Web Audio API) para criar frequências de relaxamento que acalmam a ansiedade física imediatamente. Ajuste seus fones.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {GUIDED_AUDIOS.map((item) => {
                    const isPlayingThis = activeAudio === item.id;
                    return (
                      <div 
                        key={item.id}
                        className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 transition-all ${
                          isPlayingThis
                            ? 'bg-gradient-to-b from-slate-900 to-amber-950/20 border-amber-500 shadow-xl'
                            : 'bg-slate-900 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-500">
                              🕒 {item.duration} MINUTOS
                            </span>
                            {isPlayingThis && (
                              <div className="flex gap-0.5 items-end h-3">
                                <span className="w-1 bg-amber-500 rounded-full animate-pulse h-2" />
                                <span className="w-1 bg-amber-500 rounded-full animate-pulse h-3" />
                                <span className="w-1 bg-amber-500 rounded-full animate-pulse h-1" />
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg font-serif-reading font-semibold text-slate-100 leading-snug">
                            {item.title}
                          </h3>

                          <p className="text-xs text-slate-400 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="text-[10px] text-amber-400/85 font-serif-reading italic mt-2">
                            <strong>Indicado para:</strong> {item.focus}
                          </div>
                        </div>

                        <div>
                          {isPlayingThis ? (
                            <button
                              id={`stop-audio-${item.id}`}
                              onClick={() => setActiveAudio(null)}
                              className="w-full py-3 rounded-xl bg-red-650 hover:bg-red-700 text-slate-100 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-red-800"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Interromper Sessão</span>
                            </button>
                          ) : (
                            <button
                              id={`play-audio-${item.id}`}
                              onClick={() => {
                                // Direct synchronous interaction bypasses strict browser autoplay policies
                                try {
                                  ambientSound.start(item.audioMode);
                                  ambientSound.setVolume(audioVolume);
                                } catch (e) {
                                  console.error("Audio trigger failed:", e);
                                }
                                setActiveAudio(item.id);
                              }}
                              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Iniciar Ouvido Atento</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Breathing Tool inside Guided Audio to give an intense feeling of peace */}
                <div id="breathing-tool" className="p-8 rounded-2xl bg-slate-900 border border-slate-850 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="max-w-md space-y-2">
                    <span className="text-[10px] tracking-widest font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Exercício de Respiração Silenciosa</span>
                    <h3 className="text-xl font-serif-reading font-semibold text-slate-100">Harmonia Respiratória de Fé</h3>
                    <p className="text-xs text-slate-400">
                      Siga o círculo luminoso que respira devagar. Inspire quando expandir segurando na glória do Senhor, expire quando encolher deitando fora as ansiedades.
                    </p>
                  </div>

                  <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Breathing circle pulsing via custom css */}
                    <div className="absolute w-20 h-20 rounded-full bg-amber-500/25 border-2 border-amber-400 animate-breathing-circle" />
                    <span className="text-xs font-mono tracking-wider font-semibold text-amber-500 z-10 select-none">RESPIRAR</span>
                  </div>

                  <span className="text-[11px] text-slate-500 tracking-wide font-mono">Recomendamos fazer este exercício durante 3 minutos escutando os áudios acima.</span>
                </div>
              </motion.div>
            )}

            {/* TAB: NOVENAS */}
            {tab === 'novenas' && (
              <motion.div
                key="novenas-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif-sacred text-amber-500 font-semibold tracking-wide">
                    Novenas Devocionais Ativas
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Nenhum nó espiritual é definitivo. Acompanhe a novena clássica de desatar nós emocionais e guarde o seu progresso pessoal de cada dia.
                  </p>
                </div>

                {STATIC_NOVENAS.map((novena) => {
                  const completedDays = completedNovenaDays[novena.id] || [];
                  const percentComplete = Math.round((completedDays.length / novena.days.length) * 100);

                  return (
                    <div key={novena.id} className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-850 space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-serif-reading font-bold text-slate-200">{novena.title}</h3>
                          <p className="text-xs text-slate-400 italic">Alvo principal de preces: {novena.target}</p>
                        </div>
                        
                        {/* Progress display */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono text-zinc-400">Progresso Geral</span>
                            <p className="text-sm font-bold text-amber-500">{completedDays.length} de {novena.days.length} Dias ({percentComplete}%)</p>
                          </div>
                          <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${percentComplete}%` }} />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 font-serif-reading leading-relaxed">
                        {novena.description}
                      </p>

                      {/* Display days journal list */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs tracking-wider uppercase font-mono text-amber-500 font-semibold">Os 9 Dias de Oração</h4>
                        
                        <div className="space-y-2">
                          {novena.days.map((day) => {
                            const isCompleted = completedDays.includes(day.dayNum);
                            return (
                              <details 
                                key={day.dayNum}
                                className={`group p-3.5 rounded-xl border transition ${
                                  isCompleted 
                                    ? 'bg-amber-950/10 border-amber-900/30' 
                                    : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                                }`}
                              >
                                <summary className="flex items-center justify-between font-serif-reading font-semibold text-sm cursor-pointer select-none outline-none">
                                  <div className="flex items-center gap-3">
                                    <button
                                      id={`check-day-${novena.id}-${day.dayNum}`}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        toggleNovenaDay(novena.id, day.dayNum);
                                      }}
                                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                        isCompleted
                                          ? 'bg-amber-500 border-amber-600 text-slate-950'
                                          : 'bg-slate-900 border-slate-800 text-transparent hover:text-slate-500'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <span className={isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}>
                                      {day.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-semibold group-open:hidden">Expandir Prece →</span>
                                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest hidden group-open:block">Recolher</span>
                                </summary>

                                <div className="mt-4 pt-4 border-t border-slate-800/40 space-y-3 font-serif-reading text-sm text-slate-350 bg-slate-900/40 p-3 rounded-lg">
                                  <p className="italic">
                                    <strong>"Prece do Dia:"</strong> {day.prayer}
                                  </p>
                                  <p className="text-xs text-amber-400/90 leading-normal border-l border-amber-500/20 pl-3">
                                    <strong>"Contemplação espiritual recomendada:"</strong> {day.contemplation}
                                  </p>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* TAB: COMUNIDADE DE ORAÇÃO */}
            {tab === 'comunidade' && (
              <motion.div
                key="comunidade-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 text-left"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif-sacred text-amber-500 font-semibold tracking-wide">
                      Comunidade de Intercessão
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Partilhe fardos secretamente ou assine com fé. Nós fomos feitos para apoiar os passos uns dos outros.
                    </p>
                  </div>
                  
                  <button
                    onClick={fetchCommunityPrayers}
                    className="self-start text-xs font-mono px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:text-amber-400 text-slate-400"
                  >
                    🔄 Atualizar altar de orações
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* FORM TO SUBMIT NEW REQUEST */}
                  <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900 border border-slate-850 space-y-4">
                    <h3 className="text-lg font-serif-reading font-semibold text-slate-200">
                      Entregar meu Fardo ao Altar
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sinta-se seguro. O seu relato é confidencial, e carregar isso em comunhão trará paz e novas portas.
                    </p>

                    <form id="submit-prayer-request-form" onSubmit={handleSubmitCommunityPrayer} className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-400 block">Escreva o seu Clamor ou Aflição *</label>
                        <textarea
                          id="form-prayer-request-input"
                          required
                          rows={4}
                          maxLength={500}
                          placeholder="Ansiedade, portas fechadas, cura de familiar... Desabafe o seu coração em palavras."
                          value={newPrayerRequest}
                          onChange={(e) => setNewPrayerRequest(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500 resize-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono block text-right">
                          {newPrayerRequest.length}/500 caract.
                        </span>
                      </div>

                      {/* Dropdown Category */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-400 block">Foco da Aflição</label>
                        <select
                          id="form-prayer-category-input"
                          value={newPrayerCategory}
                          onChange={(e) => setNewPrayerCategory(e.target.value as any)}
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-350 outline-none focus:border-amber-500"
                        >
                          <option value="cura_interior">🌸 Cura Interior & Emoções</option>
                          <option value="protecao">🛡️ Proteção Espiritual</option>
                          <option value="prosperidade">💰 Prosperidade & Ocupação</option>
                          <option value="restauracao">🏡 Restauração de Família</option>
                          <option value="fortalecimento">💪 Fortalecimento de Fé</option>
                          <option value="outros">✝️ Outros Desabafos</option>
                        </select>
                      </div>

                      {/* Anonymous check */}
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850/80 space-y-3">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                          <input
                            id="form-prayer-anonymous-toggle"
                            type="checkbox"
                            checked={newPrayerIsAnonymous}
                            onChange={(e) => setNewPrayerIsAnonymous(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-900 text-amber-500 accent-amber-500 focus:ring-0"
                          />
                          <span>Enviar de forma Anônima</span>
                        </label>

                        {!newPrayerIsAnonymous && (
                          <div className="space-y-1.5 pt-1">
                            <label className="text-[10px] font-mono text-slate-500 block">Escreva seu Nome / Pseudônimo</label>
                            <input
                              id="form-prayer-name-input"
                              type="text"
                              required
                              maxLength={30}
                              placeholder="Seu nome ou pseudônimo"
                              value={newPrayerName}
                              onChange={(e) => setNewPrayerName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-amber-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Submit btn */}
                      <button
                        id="form-submit-prayer-btn"
                        type="submit"
                        disabled={submittingCommunity || !newPrayerRequest.trim()}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold tracking-wider text-xs uppercase cursor-pointer disabled:opacity-40"
                      >
                        {submittingCommunity ? 'Entregando ao Altar...' : 'Entregar Pedido de Oração'}
                      </button>
                    </form>
                  </div>

                  {/* PUBLIC LIST OF OTHER PEOPLE'S REQUESTS */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-xl border border-slate-850 px-4">
                      <span className="text-xs font-mono text-slate-400">Total de Altares de Clamor</span>
                      <span className="text-xs font-semibold text-amber-500 font-mono">{communityPrayers.length} fardos pendentes</span>
                    </div>

                    {loadingCommunity ? (
                      <div className="py-20 text-center text-xs text-slate-500 font-mono">
                        Carregando pedidos do altar espiritual...
                      </div>
                    ) : communityPrayers.length === 0 ? (
                      <div className="p-10 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-slate-500 text-xs font-mono">
                        Nenhum pedido no altar neste momento. Seja o primeiro a depositar uma prece.
                      </div>
                    ) : (
                      <div className="space-y-4 h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                        {communityPrayers.map((prayerItem) => {
                          const alreadyPrayed = prayedIds.includes(prayerItem.id);
                          return (
                            <div 
                              key={prayerItem.id} 
                              className="p-5 rounded-xl bg-slate-900 border border-slate-850 hover:border-slate-800 transition text-left space-y-4"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                                    {prayerItem.name.slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-200">{prayerItem.name}</p>
                                    <p className="text-[9px] text-slate-500 font-mono">
                                      {new Date(prayerItem.createdAt).toLocaleDateString('pt-BR')} às {new Date(prayerItem.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                                
                                <span className={`text-[9px] px-2.5 py-0.5 rounded-full border ${getCategoryColor(prayerItem.category)}`}>
                                  {getCategoryLabel(prayerItem.category)}
                                </span>
                              </div>

                              <p className="text-sm font-serif-reading text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-850 italic">
                                "{prayerItem.request}"
                              </p>

                              {/* Intercession Action and Count bar */}
                              <div className="flex justify-between items-center gap-4 pt-1 border-t border-slate-800/40">
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                                  <span>
                                    <strong>{prayerItem.prayersCount}</strong> intercessores segurando este fardo
                                  </span>
                                </div>

                                <button
                                  id={`pray-for-${prayerItem.id}`}
                                  disabled={alreadyPrayed}
                                  onClick={() => handlePrayForRequest(prayerItem.id)}
                                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                                    alreadyPrayed
                                      ? 'bg-slate-850 border border-slate-800 text-emerald-400 cursor-default'
                                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  <span>{alreadyPrayed ? '🙏 Oração Enviada' : '🙏 Orar pelo Irmão'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: PERSONALIZADO - AI PRAYER */}
            {tab === 'personalizado' && (
              <motion.div
                key="personalizado-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif-sacred text-amber-500 font-semibold tracking-wide flex items-center gap-2">
                    <Sparkles className="w-6 h-6 shrink-0 text-amber-400 fill-current" />
                    <span>Clamor com Inteligência Artificial</span>
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Insira seus sentimentos e dor atual. Nossa IA produzirá uma oração cristã customizada profunda e indicará uma palavra da Bíblia perfeita para consolar você hoje.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  
                  {/* AI PRAYER FORM PANEL */}
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-850 space-y-4">
                    <h3 className="text-lg font-serif-reading font-semibold text-slate-100 border-b border-slate-800 pb-2">
                      Montar Oração Customizada
                    </h3>

                    <form id="ai-prayer-request-form" onSubmit={handleGenerateAiPrayer} className="space-y-4">
                      {/* Feeling trigger */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-400 block">Sentimento Predominante *</label>
                        <select
                          id="ai-feeling-input"
                          value={aiFeeling}
                          onChange={(e) => setAiFeeling(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500"
                        >
                          <option value="ansiedade_noites_sem_dormir">Ansiedade e Noites sem Dormir</option>
                          <option value="decepcao_portas_fechadas">Decepção e Portas Fechadas</option>
                          <option value="silencio_na_alma">Silêncio de Deus e Solidão</option>
                          <option value="dor_física_doenca_corpo">Doença Física ou Fraqueza no Corpo</option>
                          <option value="desentendimento_lar">Discussões e Ruína na Família</option>
                          <option value="falta_reforco_fe">Fé Abatida e Cansaço Geral</option>
                          <option value="gratidao_graca_alcancada">Agradecimento por Graça Alcançada</option>
                        </select>
                      </div>

                      {/* Detailed situation */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-400 block">Situação Específica (Contexto Opcional)</label>
                        <textarea
                          id="ai-situation-input"
                          rows={3}
                          maxLength={300}
                          placeholder="Ex: Rezando pelo meu marido desempregado ou por uma resposta de pânico à noite."
                          value={aiSituation}
                          onChange={(e) => setAiSituation(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500 resize-none text-xs"
                        />
                      </div>

                      {/* Name to pray for */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-400 block">Deseja Incluir Nomes para Orar Contigo? (Opcional)</label>
                        <input
                          id="ai-names-input"
                          type="text"
                          placeholder="Ex: Minha mãe Lucila, meu esposo Carlos"
                          value={aiNameToPrayFor}
                          onChange={(e) => setAiNameToPrayFor(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-slate-800 text-sm opacity-90 text-slate-200 outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Prayer Focus type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-400 block">Foco Doutrinário / Tom</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'cura_interior', label: '🌸 Cura das Dores' },
                            { id: 'protecao', label: '🛡️ Proteção Celestial' },
                            { id: 'prosperidade', label: '💰 Provisão Divina' },
                            { id: 'fortalecimento', label: '💪 Renovação de Força' }
                          ].map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setAiPrayerType(type.id)}
                              className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                                aiPrayerType === type.id
                                  ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Submit trigger button */}
                      <button
                        id="ai-generate-btn"
                        type="submit"
                        disabled={generatingAi}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold uppercase tracking-wider text-xs flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {generatingAi && (
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>{generatingAi ? 'Tecendo Prece do Céu...' : 'Gerar Minha Oração Sagrada'}</span>
                      </button>
                    </form>
                  </div>

                  {/* AI PRAYER RESPONSE PRESENTATION */}
                  <div className="space-y-6">
                    {generatingAi ? (
                      <div className="p-12 rounded-2xl bg-slate-900 border border-slate-850 text-center space-y-4">
                        <div className="p-3 bg-amber-500/10 rounded-full w-12 h-12 mx-auto flex items-center justify-center animate-bounce">
                          <Feather className="w-6 h-6 text-amber-500" />
                        </div>
                        <h4 className="font-serif-reading text-lg font-semibold text-slate-200">Aconselhando seu Coração...</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                          "O Criador da vida conhece o silêncio da sua alma. Estamos tecendo as palavras sagradas e buscando o Versículo Bíblico que falará com sua angústia hoje."
                        </p>
                      </div>
                    ) : currentGeneratedPrayer ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-6 shadow-xl"
                      >
                        {/* Header Action tools */}
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                          <span className="text-[10px] text-amber-400 tracking-widest font-mono uppercase font-semibold">Prece Gerada Sob Medida</span>
                          <div className="flex items-center gap-2">
                            <button
                              id="save-ai-prayer-btn"
                              onClick={handleSaveCurrentPrayer}
                              title="Salvar Oração"
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-amber-400 text-slate-400 cursor-pointer"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${currentGeneratedPrayer.title}\n\n${currentGeneratedPrayer.greeting}\n\n${currentGeneratedPrayer.prayerParagraphs.join('\n\n')}`);
                                alert('Texto copiado com dedicação!');
                              }}
                              title="Copiar Oração"
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:text-amber-400 text-slate-400 cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title and Greeting */}
                        <div className="text-left space-y-2">
                          <h3 className="text-2xl font-serif-sacred font-bold text-amber-500 leading-snug">
                            {currentGeneratedPrayer.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-serif-reading italic leading-relaxed">
                            {currentGeneratedPrayer.greeting}
                          </p>
                        </div>

                        {/* Three detailed paragraphs */}
                        <div className="space-y-4 font-serif-reading text-base leading-relaxed text-slate-300 text-left pt-2 border-t border-slate-800/40">
                          {currentGeneratedPrayer.prayerParagraphs.map((par, idx) => (
                            <p key={idx}>{par}</p>
                          ))}
                        </div>

                        {/* Bible quote block */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 border-l-4 border-l-amber-500 text-left space-y-2">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-500">
                            Versículo Bíblico Indicado: {currentGeneratedPrayer.bibleVerse}
                          </span>
                          <p className="text-sm font-serif-reading italic text-slate-300 leading-relaxed">
                            "{currentGeneratedPrayer.bibleText}"
                          </p>
                        </div>

                        {/* Exercises indicator */}
                        <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-900/20 text-left space-y-1.5">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-400 block">Exercício De Fé Diária</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-serif-reading">
                            {currentGeneratedPrayer.spiritualExercise}
                          </p>
                        </div>

                      </motion.div>
                    ) : (
                      <div className="p-12 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center space-y-3">
                        <Feather className="w-8 h-8 text-slate-600 mx-auto" />
                        <h4 className="text-sm font-semibold text-slate-400">Preencha o formulário espiritual ao lado</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                          A Biblioteca estruturará as dores físicas, ansiedade ou desejos da família em uma oração rica, tradicional e reconfortante.
                        </p>
                      </div>
                    )}

                    {aiError && (
                      <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-rose-400 text-xs">
                        ⚠️ Nome de rede ou limite: {aiError}
                      </div>
                    )}

                    {/* SECTIONS: SAVED PREVIOUS PRAYERS LIST */}
                    {savedPrayers.length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-slate-850">
                        <h3 className="text-sm font-bold font-mono text-zinc-400 uppercase tracking-widest text-left">
                          Meus Devocionais Salvos ({savedPrayers.length})
                        </h3>

                        <div className="space-y-3">
                          {savedPrayers.map((savedDoc) => (
                            <details key={savedDoc.id} className="group p-4 rounded-xl bg-slate-900 border border-slate-850 text-left">
                              <summary className="flex justify-between items-center font-serif-reading font-semibold text-sm cursor-pointer outline-none select-none">
                                <span className="text-slate-200 hover:text-amber-400 transition pr-2">
                                  {savedDoc.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono text-slate-500 shrink-0">{savedDoc.timestamp}</span>
                                  <button
                                    id={`delete-saved-${savedDoc.id}`}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDeleteSavedPrayer(savedDoc.id);
                                    }}
                                    className="p-1.5 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                                    title="Remover dos salvos"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </summary>

                              <div className="mt-4 pt-4 border-t border-slate-800/40 space-y-4 font-serif-reading text-sm text-slate-300">
                                <p className="text-xs text-slate-400 italic">"{savedDoc.greeting}"</p>
                                
                                {savedDoc.prayerParagraphs.map((par, pIdx) => (
                                  <p key={pIdx}>{par}</p>
                                ))}

                                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-xs">
                                  <p className="font-semibold text-amber-500 mb-1">Passagem Salva: {savedDoc.bibleVerse}</p>
                                  <p className="italic text-slate-400">"{savedDoc.bibleText}"</p>
                                </div>
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BRONZE BOTTOM FOOTER */}
        <footer className="mt-12 pt-6 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>Biblioteca Sagrada — Todos os pedidos de comunhão estão sob sigilo fraterno.</span>
          </div>
          <span className="shrink-0">Versão 1.1 • Desenvolvido com profunda luz</span>
        </footer>

      </main>

      {/* DIALOG/MODAL: SEU ALTAR DE FÉ / CADASTRO DE PERFIL */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 overflow-hidden text-left shadow-2xl"
            >
              {/* Background amber glow */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif-reading font-semibold text-slate-100">
                      Identidade Devocional
                    </h3>
                    <p className="text-xs text-amber-500 font-mono tracking-wider uppercase">Seu Altar de Fé Pessoal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer flex items-center justify-center"
                  style={{ minWidth: '32px', minHeight: '32px' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-serif-reading">
                <p>
                  Configure seus dados localmente abaixo. Eles são guardados <strong className="text-amber-500 font-sans uppercase text-[10px]">exclusivamente no seu aparelho</strong> para personalizar saudações e preencher preces sem necessidade de banco de dados!
                </p>
              </div>

              <form 
                id="profile-activation-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!profileName.trim()) return;
                  handleSaveProfile(profileName, profileEmail, profileFocus);
                }} 
                className="space-y-4"
              >
                {/* Name Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-slate-400 block">Seu Nome / Apelido para Saudação *</label>
                  <input
                    id="profile-name-input"
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-slate-400 block">Seu E-mail (Opcional, pre-enche o original)</label>
                  <input
                    id="profile-email-input"
                    type="email"
                    placeholder="exemplo@dominio.com"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Focus select */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-mono text-slate-400 block">Seu Principal Foco Devocional</label>
                  <select
                    id="profile-focus-select"
                    value={profileFocus}
                    onChange={(e) => setProfileFocus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-350 outline-none focus:border-amber-500"
                  >
                    <option value="cura_interior">🌸 Cura Interior & Emoções</option>
                    <option value="protecao">🛡️ Proteção Celestial</option>
                    <option value="prosperidade">💰 Prospecção & Ocupação</option>
                    <option value="restauracao">🏡 Restauração de Família</option>
                    <option value="fortalecimento">💪 Renovação de Força</option>
                    <option value="paz_geral">✨ Paz Geral da Alma</option>
                  </select>
                </div>

                {/* Clear local profile option */}
                {userProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserProfile(null);
                      localStorage.removeItem('biblioteca_sagrada_user_profile');
                      setIsProfileModalOpen(false);
                    }}
                    className="text-[10px] text-red-400 hover:underline font-mono tracking-wide cursor-pointer transition uppercase"
                  >
                    ⚠️ Remover Perfil deste Aparelho
                  </button>
                )}

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-400 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 transition active:scale-95 text-slate-950 font-bold uppercase tracking-wider text-xs rounded-xl cursor-pointer"
                  >
                    Confirmar Perfil
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
